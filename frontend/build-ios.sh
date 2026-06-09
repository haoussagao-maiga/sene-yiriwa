#!/bin/bash

cd ios

# Build with custom flags to disable folly coroutines
xcodebuild -workspace SnYiriwa.xcworkspace \
  -scheme SnYiriwa \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  GCC_PREPROCESSOR_DEFINITIONS='$(inherited) FOLLY_HAS_COROUTINES=0 FOLLY_NO_CONFIG' \
  OTHER_CFLAGS='$(inherited) -DFOLLY_HAS_COROUTINES=0 -DFOLLY_NO_CONFIG'
