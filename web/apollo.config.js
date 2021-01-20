module.exports = {
  client: {
    includes: ["src/**/*.ts", "src/**/*.tsx"],
    excludes: ["**/__tests__/**/*"],
    addTypename: true,
    name: "web",
    service: {
      // localSchemaFile: "schema.graphql",
      name: "shop",
      url: "http://localhost:4000/graphql/",
    },
  },
};
