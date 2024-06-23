import "moment-timezone";

import moment from "moment";

export const getTimeZoneList = () => {
  const timezones = moment.tz.names();
  const uniqueTimezones = new Map();

  timezones.forEach((timezone) => {
    const offset = moment.tz(timezone).utcOffset();

    const cityParts = timezone.split("/");
    const city =
      cityParts.length > 1 ? cityParts[1].replace(/_/g, " ") : timezone;

    const offsetLabel = `GMT${offset >= 0 ? "+" : "-"}${Math.floor(
      Math.abs(offset) / 60
    )}:${String(Math.abs(offset) % 60).padStart(2, "0")}`;

    if (!uniqueTimezones.has(offsetLabel)) {
      uniqueTimezones.set(offsetLabel, [city]);
    } else {
      const existingCities = uniqueTimezones.get(offsetLabel);
      existingCities.push(city);
      uniqueTimezones.set(offsetLabel, existingCities);
    }
  });

  const sortedTimezones = Array.from(uniqueTimezones.entries()).sort((a, b) => {
    const offsetA = parseFloat(a[0].substring(4).replace(":", "."));
    const offsetB = parseFloat(b[0].substring(4).replace(":", "."));
    return offsetA - offsetB;
  });

  const uniqueTimezonesArray = sortedTimezones.map(([offsetLabel, cities]) => {
    const cityList = cities.slice(0, 3).join(",");
    return `${offsetLabel} (${cityList})`;
  });
  return uniqueTimezonesArray;
};

export const get_time_zone_manual = () => {
  // eslint-disable-next-line no-unused-vars
  const timezonesWithCity = [
    "Set Timezone",
    "(GMT-01:00) Azores - Azores Standard Time",
    "(GMT-01:00) Cape Verde Islands - Cape Verde Standard Time",
    "(GMT-02:00) Mid-Atlantic - Mid-Atlantic Standard Time",
    "(GMT-03:00) Brasilia - E. South America Standard Time",
    "(GMT-03:00) Buenos Aires, Georgetown - SA Eastern Standard Time",
    "(GMT-03:00) Greenland - Greenland Standard Time",
    "(GMT-03:30) Newfoundland and Labrador - Newfoundland Standard Time",
    "(GMT-04:00) Atlantic Time (Canada) - Atlantic Standard Time",
    "(GMT-04:00) Caracas, La Paz - SA Western Standard Time",
    "(GMT-04:00) Manaus - Central Brazilian Standard Time",
    "(GMT-04:00) Santiago - Pacific SA Standard Time",
    "(GMT-05:00) Bogota, Lima, Quito - SA Pacific Standard Time",
    "(GMT-05:00) Eastern Time (US and Canada) - Eastern Standard Time",
    "(GMT-05:00) Indiana (East) - US Eastern Standard Time",
    "(GMT-06:00) Central America - Central America Standard Time",
    "(GMT-06:00) Central Time (US and Canada) - Central Standard Time",
    "(GMT-06:00) Guadalajara, Mexico City, Monterrey - Central Standard Time (Mexico)",
    "(GMT-06:00) Saskatchewan - Canada Central Standard Time",
    "(GMT-07:00) Arizona - US Mountain Standard Time",
    "(GMT-07:00) Chihuahua, La Paz, Mazatlan - Mountain Standard Time (Mexico)",
    "(GMT-07:00) Mountain Time (US and Canada) - Mountain Standard Time",
    "(GMT-08:00) Pacific Time (US and Canada); Tijuana - Pacific Standard Time",
    "(GMT-09:00) Alaska - Alaskan Standard Time",
    "(GMT-10:00) Hawaii - Hawaiian Standard Time",
    "(GMT-11:00) Midway Island, Samoa - Samoa Standard Time",
    "(GMT) Casablanca, Monrovia - Greenwich Standard Time",
    "(GMT) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London - GMT Standard Time",
    "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna - W. Europe Standard Time",
    "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague - Central Europe Standard Time",
    "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris - Romance Standard Time",
    "(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb - Central European Standard Time",
    "(GMT+01:00) West Central Africa - W. Central Africa Standard Time",
    "(GMT+02:00) Athens, Bucharest, Istanbul - GTB Standard Time",
    "(GMT+02:00) Cairo - Egypt Standard Time",
    "(GMT+02:00) Harare, Pretoria - South Africa Standard Time",
    "(GMT+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius - FLE Standard Time",
    "(GMT+02:00) Jerusalem - Israel Standard Time",
    "(GMT+02:00) Minsk - E. Europe Standard Time",
    "(GMT+02:00) Windhoek - Namibia Standard Time",
    "(GMT+03:00) Baghdad - Arabic Standard Time",
    "(GMT+03:00) Kuwait, Riyadh - Arab Standard Time",
    "(GMT+03:00) Moscow, St. Petersburg, Volgograd - Russian Standard Time",
    "(GMT+03:00) Nairobi - E. Africa Standard Time",
    "(GMT+03:30) Tehran - Iran Standard Time",
    "(GMT+04:00) Abu Dhabi, Muscat - Arabian Standard Time",
    "(GMT+04:00) Baku - Azerbaijan Standard Time",
    "(GMT+04:00) Tblisi - Georgian Standard Time",
    "(GMT+04:00) Yerevan - Caucasus Standard Time",
    "(GMT+04:30) Kabul - Afghanistan Standard Time",
    "(GMT+05:00) Ekaterinburg - Ekaterinburg Standard Time",
    "(GMT+05:00) Islamabad, Karachi, Tashkent - West Asia Standard Time",
    "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi - India Standard Time",
    "(GMT+05:45) Kathmandu - Nepal Standard Time",
    "(GMT+06:00) Almaty, Novosibirsk - N. Central Asia Standard Time",
    "(GMT+06:00) Astana, Dhaka - Central Asia Standard Time",
    "(GMT+06:00) Sri Jayawardenepura - Sri Lanka Standard Time",
    "(GMT+06:30) Yangon (Rangoon) - Myanmar Standard Time",
    "(GMT+07:00) Bangkok, Hanoi, Jakarta - SE Asia Standard Time",
    "(GMT+07:00) Krasnoyarsk - North Asia Standard Time",
    "(GMT+08:00) Beijing, Chongqing, Hong Kong SAR, Urumqi - China Standard Time",
    "(GMT+08:00) Irkutsk, Ulaanbaatar - North Asia East Standard Time",
    "(GMT+08:00) Kuala Lumpur, Singapore - Singapore Standard Time",
    "(GMT+08:00) Perth - W. Australia Standard Time",
    "(GMT+08:00) Taipei - Taipei Standard Time",
    "(GMT+09:00) Osaka, Sapporo, Tokyo - Tokyo Standard Time",
    "(GMT+09:00) Seoul - Korea Standard Time",
    "(GMT+09:00) Yakutsk - Yakutsk Standard Time",
    "(GMT+09:30) Adelaide - Cen. Australia Standard Time",
    "(GMT+09:30) Darwin - AUS Central Standard Time",
    "(GMT+10:00) Brisbane - E. Australia Standard Time",
    "(GMT+10:00) Canberra, Melbourne, Sydney - AUS Eastern Standard Time",
    "(GMT+10:00) Guam, Port Moresby - West Pacific Standard Time",
    "(GMT+10:00) Hobart - Tasmania Standard Time",
    "(GMT+10:00) Vladivostok - Vladivostok Standard Time",
    "(GMT+11:00) Magadan, Solomon Islands, New Caledonia - Central Pacific Standard Time",
    "(GMT+12:00) Auckland, Wellington - New Zealand Standard Time",
    "(GMT+12:00) Fiji Islands, Kamchatka, Marshall Islands - Fiji Standard Time",
    "(GMT+13:00) Nuku'alofa - Tonga Standard Time"
  ];

  const timezones = [
    "GMT-01:00 - Azores Standard Time",
    "GMT-01:00 - Cape Verde Standard Time",
    "GMT-02:00 - Mid-Atlantic Standard Time",
    "GMT-03:00 - E. South America Standard Time",
    "GMT-03:00 - SA Eastern Standard Time",
    "GMT-03:00 - Greenland Standard Time",
    "GMT-03:30 - Newfoundland Standard Time",
    "GMT-04:00 - Atlantic Standard Time",
    "GMT-04:00 - SA Western Standard Time",
    "GMT-04:00 - Central Brazilian Standard Time",
    "GMT-04:00 - Pacific SA Standard Time",
    "GMT-05:00 - SA Pacific Standard Time",
    "GMT-05:00 - Eastern Standard Time",
    "GMT-05:00 - US Eastern Standard Time",
    "GMT-06:00 - Central America Standard Time",
    "GMT-06:00 - Central Standard Time",
    "GMT-06:00 - Central Standard Time (Mexico)",
    "GMT-06:00 - Canada Central Standard Time",
    "GMT-07:00 - US Mountain Standard Time",
    "GMT-07:00 - Mountain Standard Time (Mexico)",
    "GMT-07:00 - Mountain Standard Time",
    "GMT-08:00 - Pacific Standard Time",
    "GMT-09:00 - Alaskan Standard Time",
    "GMT-10:00 - Hawaiian Standard Time",
    "GMT-11:00 - Samoa Standard Time",
    "GMT - Greenwich Standard Time",
    "GMT+01:00 - W. Europe Standard Time",
    "GMT+01:00 - Central Europe Standard Time",
    "GMT+01:00 - Romance Standard Time",
    "GMT+01:00 - Central European Standard Time",
    "GMT+01:00 - W. Central Africa Standard Time",
    "GMT+02:00 - GTB Standard Time",
    "GMT+02:00 - Egypt Standard Time",
    "GMT+02:00 - South Africa Standard Time",
    "GMT+02:00 - FLE Standard Time",
    "GMT+02:00 - Israel Standard Time",
    "GMT+02:00 - E. Europe Standard Time",
    "GMT+02:00 - Namibia Standard Time",
    "GMT+03:00 - Arabic Standard Time",
    "GMT+03:00 - Arab Standard Time",
    "GMT+03:00 - Russian Standard Time",
    "GMT+03:00 - E. Africa Standard Time",
    "GMT+03:30 - Iran Standard Time",
    "GMT+04:00 - Arabian Standard Time",
    "GMT+04:00 - Azerbaijan Standard Time",
    "GMT+04:00 - Georgian Standard Time",
    "GMT+04:00 - Caucasus Standard Time",
    "GMT+04:30 - Afghanistan Standard Time",
    "GMT+05:00 - Ekaterinburg Standard Time",
    "GMT+05:00 - West Asia Standard Time",
    "GMT+05:30 - India Standard Time",
    "GMT+05:45 - Nepal Standard Time",
    "GMT+06:00 - N. Central Asia Standard Time",
    "GMT+06:00 - Central Asia Standard Time",
    "GMT+06:00 - Sri Lanka Standard Time",
    "GMT+06:30 - Myanmar Standard Time",
    "GMT+07:00 - SE Asia Standard Time",
    "GMT+07:00 - North Asia Standard Time",
    "GMT+08:00 - China Standard Time",
    "GMT+08:00 - North Asia East Standard Time",
    "GMT+08:00 - Singapore Standard Time",
    "GMT+08:00 - W. Australia Standard Time",
    "GMT+08:00 - Taipei Standard Time",
    "GMT+09:00 - Tokyo Standard Time",
    "GMT+09:00 - Korea Standard Time",
    "GMT+09:00 - Yakutsk Standard Time",
    "GMT+09:30 - Cen. Australia Standard Time",
    "GMT+09:30 - AUS Central Standard Time",
    "GMT+10:00 - E. Australia Standard Time",
    "GMT+10:00 - AUS Eastern Standard Time",
    "GMT+10:00 - West Pacific Standard Time",
    "GMT+10:00 - Tasmania Standard Time",
    "GMT+10:00 - Vladivostok Standard Time",
    "GMT+11:00 - Central Pacific Standard Time",
    "GMT+12:00 - New Zealand Standard Time",
    "GMT+12:00 - Fiji Standard Time",
    "GMT+13:00 - Tonga Standard Time"
  ];

  return timezones;
};
