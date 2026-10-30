#!/bin/bash
# Install Cody's REPAIR_005 RETEST_001 oracle and reader probes into the scratch app.
# Only output paths and the port are changed.
set -e
S=/tmp/claude-1000/-home-moose-NEXTJS-CYBER-PHARMA-cyph-stripe-subscription-portal-v1/c664800a-2142-4b48-af44-b0974b0dbb98/scratchpad/r010
A=$S/qa_in/QAM/AUTOMATION/repair005
OUT=$S/out/$1; mkdir -p $OUT
cd $S/app
rm -rf qa-oracle qa-readers qa-predecessors
cp -r $A/qa-oracle $A/qa-readers $A/qa-predecessors .
cp $A/qa-oracle.config.cjs $A/qa-readers.config.ts .
sed -i -e "s#/tmp/cody-r5-#$OUT/cody-r5-#g" -e "s#localhost:3115#localhost:3109#g" qa-oracle/*.ts qa-readers/*.ts qa-readers.config.ts
