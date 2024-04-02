export const getValueAndCount = (object, field, map) => {
    const activeObject = {};
    const inactiveObject = {};
    const deletedObject = {};
    if (object && field in object) {
      for (const item of object[field].values()) {
        if (item?.isDeleted === true) {
          deletedObject[item[map]] = item;
        } else if (item?.is_active === false) {
          inactiveObject[item[map]] = item;
        } else {
          activeObject[item[map]] = item;
        }
      }
    }
    return {
      activeObject,
      inactiveObject,
      deletedObject
    };
  };