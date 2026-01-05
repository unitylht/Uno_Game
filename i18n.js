const locales = ["es", "en"];
const defaultLocale = "es";

module.exports = {
  locales,
  defaultLocale,
  pages: {
    "*": ["common"],
    "/": ["index"],
    "/rooms/[roomId]": ["roomId"],
    "/rooms/[roomId]/players/[playerId]": ["playerId"],
  },
};

module.exports.allLanguages = locales;
module.exports.defaultLanguage = defaultLocale;
