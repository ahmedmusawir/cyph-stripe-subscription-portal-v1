#!/bin/bash
# Install Cody's REPAIR_003 RETEST_001 probes into the scratch app. Only output paths, the
# require path of the scratch node_modules, the browser profile and the port are changed.
set -e
S=/tmp/claude-1000/-home-moose-NEXTJS-CYBER-PHARMA-cyph-stripe-subscription-portal-v1/c664800a-2142-4b48-af44-b0974b0dbb98/scratchpad/r007
A=$S/qa_in/QAM/AUTOMATION/repair003
OUT=$S/out/$1; mkdir -p $OUT
cd $S/app
rm -rf qa-independent qa-predecessors qa-extra
cp -r $A/qa-independent $A/qa-predecessors $A/qa-extra .
cp $A/qa-independent.config.cjs $A/qa-extra.config.ts .
sub() { sed -i -e "s#/tmp/cody-r3-snapshot/node_modules#$S/app/node_modules#g" -e "s#/tmp/cody-r3-zoom-profile#$OUT/zoom-profile#g" -e "s#/tmp/cody-r3-metrics.cjs#$S/app/cody-r3-metrics.cjs#g" -e "s#/tmp/cody-r3-#$OUT/cody-r3-#g" -e "s#localhost:3113#localhost:3109#g" "$@"; }
sub qa-independent/*.test.ts qa-extra/*.ts qa-extra.config.ts
cp $A/cody-r3-focus.cjs $A/cody-r3-metrics.cjs .; sub cody-r3-focus.cjs cody-r3-metrics.cjs
