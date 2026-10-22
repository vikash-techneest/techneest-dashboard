const parseUserAgent = (ua = "") => {
  const userAgent = String(ua);
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType = "Desktop";

  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
    deviceType = /ipad|tablet/i.test(userAgent) ? "Tablet" : "Mobile";
  }

  if (/edg/i.test(userAgent)) browser = "Microsoft Edge";
  else if (/chrome|crios/i.test(userAgent)) browser = "Google Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Mozilla Firefox";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Apple Safari";
  else if (/postman/i.test(userAgent)) browser = "Postman Runtime";
  else if (/curl/i.test(userAgent)) browser = "cURL";

  if (/windows nt/i.test(userAgent)) os = "Windows";
  else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
  else if (/linux/i.test(userAgent)) os = "Linux";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";

  return {
    browser,
    os,
    deviceType,
    raw: userAgent.slice(0, 300),
  };
};

const extractClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
};

module.exports = {
  parseUserAgent,
  extractClientIp,
};
