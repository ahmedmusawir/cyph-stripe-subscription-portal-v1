#!/bin/bash
# Install Cody's REPAIR_004 RETEST_001 transition probes into the scratch app. Only output
# paths and the port are changed.
set -e
S=/tmp/claude-1000/-home-moose-NEXTJS-CYBER-PHARMA-cyph-stripe-subscription-portal-v1/c664800a-2142-4b48-af44-b0974b0dbb98/scratchpad/r009
A=$S/qa_in/QAM/AUTOMATION/repair004
OUT=$S/out/$1; mkdir -p $OUT
cd $S/app
rm -rf qa-transition qa-transition-browser qa-predecessors
cp -r $A/qa-transition $A/qa-transition-browser $A/qa-predecessors .
cp $A/qa-transition.config.cjs $A/qa-transition-browser.config.ts .
sed -i -e "s#/tmp/cody-r4-#$OUT/cody-r4-#g" -e "s#localhost:3114#localhost:3109#g" qa-transition/*.ts qa-transition-browser/*.ts qa-transition-browser.config.ts
