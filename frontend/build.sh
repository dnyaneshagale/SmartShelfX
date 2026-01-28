#!/bin/bash

# Replace environment variables in env.js
envsubst < src/assets/env.js > src/assets/env.tmp.js && mv src/assets/env.tmp.js src/assets/env.js

# Build the Angular app
npm run build
