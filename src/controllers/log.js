// import { deleteFile } from "../helpers/apiHelper.js";
import {
  getPresignedUrl,
  getPresignedUrls
  //   uploadToS3
} from "../helpers/awsS3Helper.js";
import { CONST_STRINGS } from "../helpers/constants.js";
import { ENV_VAR } from "../helpers/env.js";
import {
  AutomationTest,
  EndPoint,
  LocalLogger,
  ProdLogger
} from "../models/index.js";

const bucketName = "automation-test-screenshots-bucket";

const matchExpressRoute = (routeUrl, expressPaths) => {
  for (const expressPath of expressPaths) {
    if (!routeUrl || !expressPath) {
      return null;
    }

    const pathSegments = expressPath.split("/");
    const urlSegments = routeUrl.split("/");

    if (
      pathSegments.length === urlSegments.length ||
      expressPath.endsWith("?")
    ) {
      const params = {};
      let isMatch = true;

      for (let i = 0; i < pathSegments.length; i++) {
        const pathSegment = pathSegments[i];
        const urlSegment = urlSegments[i];

        if (pathSegment.startsWith(":")) {
          const paramName = pathSegment.slice(1);
          params[paramName] = urlSegment;
        } else if (pathSegment === urlSegment) {
          continue;
        } else if (pathSegment.endsWith("?")) {
          // Optional parameter
          continue;
        } else {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return { path: expressPath, params };
      }
    }
  }

  return null;
};

const calculateAverage = (array) => {
  if (array.length === 0) {
    return 0;
  }
  const sum = array.reduce(
    (accumulator, currentValue) => accumulator + currentValue || 0,
    0
  );
  const average = sum > 0 ? sum / array.length : 0;
  return average;
};

const typeBufferObject = {
  postman: ["postman", null],
  local: ["http://localhost:3000"],
  // prod: ["https://psgbs.com", "https://www.psgbs.com"]
};

const mapLogsToOverview = (logs, expressPathArray, type, filterKey) => {
  return logs.reduce((acc, item) => {
    const routeUrl = item.meta.path;
    const origin = item.meta.origin;
    const typeBuffer = typeBufferObject?.[type];
    const res = matchExpressRoute(routeUrl, expressPathArray);
    const path = res?.path || "No_Path";
    if (filterKey && item.message !== filterKey) {
      return acc;
    }
    if (type !== "all" && !typeBuffer?.includes(origin)) {
      return acc;
    }
    if (acc[path]) {
      acc[path].logs.push(item);
      acc[path].controller = item.message;
    } else {
      acc[path] = {
        controller: item.message,
        logs: [item]
      };
    }
    return acc;
  }, {});
};

export const getEndpointStatistics = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getEndpointStatistics" };
    const {
      startDate,
      endDate,
      startTime,
      endTime,
      endPoint: requestEndpoint,
      type = "all",
      email,
      origin,
      requestTime,
      responseDataSize
    } = req.query;

    if (!startDate || !endDate || !startTime || !endTime) {
      throw new Error(CONST_STRINGS.MISSING_REQUIRED_INPUTS);
    }

    const startTimestamp = new Date(startDate);
    const endTimestamp = new Date(endDate);

    const [startHours, startMinutes] = startTime.split(":");
    const [endHours, endMinutes] = endTime.split(":");

    startTimestamp.setHours(startHours);
    startTimestamp.setMinutes(startMinutes);
    startTimestamp.setSeconds(0);
    endTimestamp.setHours(endHours);
    endTimestamp.setMinutes(endMinutes);
    endTimestamp.setSeconds(59);

    // startTimestamp.setHours(startTimestamp.getHours() + 5);
    // startTimestamp.setMinutes(startTimestamp.getMinutes() + 30);

    // endTimestamp.setHours(endTimestamp.getHours() + 5);
    // endTimestamp.setMinutes(endTimestamp.getMinutes() + 30);
    // endTimestamp.setDate(endTimestamp.getDate() + 1);

    const LoggerModel = ENV_VAR.ENV === "prod" ? ProdLogger : LocalLogger;
    const rawLogs = await LoggerModel.find({
      timestamp: {
        $gte: startTimestamp,
        $lte: endTimestamp
      },
      ...(email ? { "meta.email": email } : {}),
      ...(origin
        ? {
            "meta.origin": { $regex: new RegExp(origin), $options: "i" }
          }
        : {}),
      ...(requestTime
        ? { "meta.timeTakenInMs": { $gte: parseInt(requestTime) } }
        : {}),
      ...(responseDataSize
        ? { "meta.responseDataSizeInKb": { $gte: parseInt(responseDataSize) } }
        : {})
    });
    const existingEndpoints =
      (await EndPoint.findOne({ env: ENV_VAR.ENV })) || {};
    const { endPoints } = existingEndpoints.toObject();
    const expressPathArray = endPoints.map((item) => item.path);
    const result = mapLogsToOverview(
      rawLogs,
      expressPathArray,
      type,
      requestEndpoint
    );
    let resultData = endPoints.map((endPoint) => {
      const { controller, logs = [] } = result[endPoint.path] || {};
      const numberOfRequests = logs.length;
      const errorCount = logs.filter((item) => item.meta.status !== 200).length;
      const errorRate = Number(
        errorCount > 0 ? ((100 * errorCount) / numberOfRequests).toFixed(2) : 0
      );
      const controllerFromPath =
        endPoint.middlewares?.[endPoint.middlewares?.length - 2] || "";
      return {
        ...endPoint,
        controller: controller || controllerFromPath,
        numberOfRequests,
        averageTimeinMs: Number(
          calculateAverage(logs.map((item) => item.meta.timeTakenInMs)).toFixed(
            0
          )
        ),
        averageResponseDataSizeInKb: Number(
          calculateAverage(
            logs.map((item) => Number(item.meta.responseDataSizeInKb))
          ).toFixed(0)
        ),
        verifyToken: (endPoint.middlewares || []).includes("verifyToken"),
        verifyAdmin: (endPoint.middlewares || []).includes("verifyAdmin"),
        lastExecutedAt: logs[logs.length - 1]?.toObject().timestamp,
        errorCount,
        errorRate,
        logs: requestEndpoint ? logs : []
      };
    });

    if (requestEndpoint) {
      resultData = resultData.filter(
        (item) => item.controller === requestEndpoint
      );
    }

    const responseMessage = CONST_STRINGS.ENDPOINTS_RETRIVED;
    const responseData = resultData;
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || ""
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const getAutomationTestStatistics = async (req, res, next) => {
  try {
    req.meta = { endpoint: "getAutomationTestStatistics" };
    const {
      start_date,
      end_date,
      type = "all",
      testId: requestTestId
    } = req.params;

    const startTimestamp = start_date
      ? new Date(start_date)
      : new Date("2023-12-01");
    const endTimestamp = end_date ? new Date(end_date) : new Date();
    endTimestamp.setDate(endTimestamp.getDate() + 1);

    const autoMationTests = await AutomationTest.find({
      ...(type !== "all" ? { type } : {}),
      ...(requestTestId ? { testId: requestTestId } : {}),
      createdAt: {
        $gte: startTimestamp,
        $lte: endTimestamp
      }
    });

    const resData = await Promise.all(
      autoMationTests.map(
        async ({
          testId,
          status,
          startedAt,
          completedAt,
          frontend,
          backend,
          type,
          testMap
        }) => {
          const count = testMap.size;
          let passCount = 0;
          let subTestCount = 0;
          let subTestPassCount = 0;
          const subTestData = {};
          await Promise.all(
            Array.from(testMap).map(async ([key, entry]) => {
              if (entry.status) {
                passCount++;
              }
              subTestData[key] = {
                testMap: {},
                count: entry.testMap.size,
                passCount: 0
              };

              await Promise.all(
                Array.from(entry.testMap).map(async ([k, e]) => {
                  subTestCount++;

                  const { name, status } = e;
                  let s3Key;
                  let url;
                  if (requestTestId) {
                    const splitKey =
                      name.split(" - TC").length === 2 ? " - TC" : " - {";
                    const splitAdd = splitKey === " - TC" ? "/TC" : "/{";
                    s3Key = `${testId}/${key}/${
                      name.split(splitKey)?.[0] || ""
                    }${splitAdd}${name.split(splitKey)?.[1] || ""}`;
                    url = await getPresignedUrl(bucketName, s3Key);
                  }
                  subTestData[key].testMap[name] = {
                    name,
                    status,
                    key: s3Key,
                    url
                  };

                  if (status) {
                    subTestPassCount++;
                    subTestData[key].passCount = subTestData[key].passCount + 1;
                  }
                })
              );

              subTestData[key].failCount =
                subTestData[key].count - subTestData[key].passCount;
            })
          );
          return {
            testId,
            type,
            frontend,
            backend,
            startedAt,
            completedAt,
            status,
            count,
            passCount,
            failCount: count - passCount,
            subTestCount,
            subTestPassCount,
            subTestFailCount: subTestCount - subTestPassCount,
            subTestData
          };
        }
      )
    );

    const responseMessage = CONST_STRINGS.AUTOMATION_TEST_RESULTS_RETREIVED;
    const responseData = resData;
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || ""
    };

    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};

export const logAutomationTestResult = async (req, res, next) => {
  try {
    req.meta = { endpoint: "logAutomationTestResult" };
    const {
      testId,
      status,
      startedAt,
      completedAt,
      frontend,
      backend,
      type,
      data,
      key
    } = req.body;
    if (key !== CONST_STRINGS.PASS_KEY) {
      throw new Error(CONST_STRINGS.INVALD_PASS_KEY);
    }

    const keys = data.map(({ path }) => path);
    const presignedUrls = await getPresignedUrls(bucketName, keys);

    let testData = await AutomationTest.findOne({
      testId
    });
    if (!testData) {
      testData = new AutomationTest({
        testId,
        status,
        startedAt: new Date(startedAt),
        completedAt: new Date(completedAt),
        frontend,
        backend,
        type
      });
    }

    data.forEach(({ folderName, fileName, status }) => {
      const [folder, subFolder] = folderName.split("/").slice(0, 2);

      const { testMap } = testData;
      const currentFolder = testMap.get(folder);

      if (currentFolder) {
        const testMap = currentFolder.testMap;
        const setData = {
          name: `${subFolder} - ${fileName}`,
          status
        };
        const id = testMap.size + 1;

        testMap.set(id.toString(), setData);
        if (!status) {
          currentFolder.status = status;
        }
      } else {
        const tempMap = new Map();
        const setData = {
          name: `${subFolder} - ${fileName}`,
          status
        };
        tempMap.set("1", setData);

        const setData_new = {
          name: folder,
          testMap: tempMap,
          status
        };
        testMap.set(folder, setData_new);
      }

      if (!status) {
        testData.status = status;
      }
    });
    await testData.save();
    const responseData = { presignedUrls };
    const responseMessage = "";
    req.data = {
      statuscode: 200,
      responseData: responseData || {},
      responseMessage: responseMessage || {}
    };
    next();
  } catch (err) {
    req.err = err;
    next(err);
  }
};
