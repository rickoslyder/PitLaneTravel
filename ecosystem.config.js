module.exports = {
  apps: [
    {
      name: "pit-lane-travel",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
