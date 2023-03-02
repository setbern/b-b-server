import redis from "../redis";

// parse hash JSON
// parses a hash returned from redis
export const parseHashJSON = (hashObj: any) => {
  // create a new obejct with same keys as hashObj but with values parsed as JSON
  const parsedHashObj = Object.keys(hashObj).reduce((acc, key) => {
    return {
      ...acc,
      [key]: JSON.parse(hashObj[key]),
    };
  }, {});
  return parsedHashObj;
};

// fetch all the keys of a redis hash
export const fetchHash = async (key: string) => {
  try {
    const hashObj = await redis.hGetAll(key);
    // create a new obejct with same keys as hashObj but with values parsed as JSON
    const parsedHashObj = Object.keys(hashObj).reduce((acc, key) => {
      return {
        ...acc,
        [key]: JSON.parse(hashObj[key]),
      };
    }, {});
    return parsedHashObj;
  } catch (err) {
    console.log("fechHash error", err);
    return null;
  }
};

// fetch a spefic key from a redis hash
export const getKeyAtHash = async (key: string, hashKey: string) => {
  try {
    const hashKeyRes = await redis.hmGet(hashKey, key);

    if (hashKeyRes) {
      const parsedHash = JSON.parse(hashKeyRes[0]);
      return parsedHash;
    } else {
      return null;
    }
  } catch (err) {
    console.log("getKeyAtHash error", err);
    return null;
  }
};
