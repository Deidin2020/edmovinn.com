module.exports = {
    apps : [
        {
            name   : "edmovinninninninninninninn Website",
            cwd : "./",
            args: "start",
            exec_mode: 'cluster',
            // Must stay at 1 while the Kuveyt Turk middleware keeps pending payments
            // and rate-limit counters in process memory: with several workers the
            // bank's /ok callback can land on a worker that never saw /start, which
            // charges the customer and then reports a failure.
            // Raise this only after that state moves to Redis or the backend.
            instances: 1,
            script: 'npm',
            env_production: {
                SERVER_PORT: 3005,
                NODE_ENV: "production"
            }
        }
    ]
}
