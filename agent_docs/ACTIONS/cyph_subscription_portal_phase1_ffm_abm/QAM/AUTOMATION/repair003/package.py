from pathlib import Path
import json,hashlib,zipfile,subprocess,re,datetime,shutil
r=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1');p=r/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm';q=p/'QAM';e=q/'evidence/repair003'
sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=r).decode().strip();assert sha=='d6fe67839961fcbbf801b0bb04d3a2522e7b1f36'
ph=hashlib.sha256((q/'QAM_TEST_PLAN.md').read_bytes()).hexdigest();assert ph=='4432895ed0dfc8dcf2b90a9e43b0d1b5de2245d87035b27f83a8586488279597'
status=subprocess.check_output(['git','status','--short'],cwd=r).decode();(e/'identity-final.txt').write_text('HEAD '+sha+'\nPlan SHA256 '+ph+'\n'+status)
changed=subprocess.check_output(['git','diff','--name-only'],cwd=r).decode().splitlines();manifest_hash=hashlib.sha256((e/'snapshot-input-manifest.json').read_bytes()).hexdigest()
assert manifest_hash=='61a39c96c5162cc36e027d852affeca76fcc82617c631121c3c0870af63bf502'
manifest=json.loads((e/'snapshot-input-manifest.json').read_text())
assert all(hashlib.sha256((Path('/tmp/cody-r3-snapshot')/x['path']).read_bytes()).hexdigest()==x['sha256'] for x in manifest['files'])
assert subprocess.check_output(['git','rev-parse','HEAD^'],cwd=r).decode().strip()=='24cf075dc3c6252bc22712b067cbf9a8680f24fa'
assert subprocess.check_output(['git','branch','--show-current'],cwd=r).decode().strip()=='qa/ffm-abm-001-subscription-portal'
subprocess.run(['git','check-ignore','-q','.env.qa.local'],cwd=r,check=True);assert not subprocess.check_output(['git','ls-files','.env.qa.local'],cwd=r).strip()
# Explicit selected roots and extensions; never include other QAM artifacts or nested archives.
docs=['QAM/REVIEW_START_HERE.md','QAM/QAM_ENTRY.md','QAM/QAM_STATE.md','QAM/QAM_APPROVAL.md','QAM/QAM_TEST_PLAN.md','QAM/QAM_EXECUTION_REPORT.md','QAM/AC_EVIDENCE_MATRIX.md','QAM/FINDINGS.md','QAM/QAM_CLEANUP_REPORT.md','QAM/QAM_RECON_REPORT.md','QAM/QAM_PREFLIGHT.md','QAM/QAM_RISK_REQUIREMENTS.md','QAM/QAM_MANIFEST.md','QAM/HANDOFFS/ENGINEERING_HANDOFF.md','QAM/HANDOFFS/CYPH_Q1_LEAD_DECISION_001_2026-10-28_SUPERSEDED.md','ACCEPTANCE_SPEC.md','ACCEPTANCE_LEDGER.md','RULINGS.md','_project/APP_BRIEF.md','_project/DATA_CONTRACT.md','_project/IMPLEMENTATION_CONTRACT.md','_project/UI_SPEC.md','_project/portal-contract.ts','EVIDENCE/E2_ENGINEERING_REPORT.md','EVIDENCE/E2_STALE_INSTRUCTION_CHECK.md','QAM/GOVERNING/PROVENANCE.md','QAM/GOVERNING/QAM_PLAYBOOK.md','QAM/GOVERNING/QA_PLAYBOOK.md','QAM/GOVERNING/RRM_PLAYBOOK.md','_design/approved_v1_0/renders/account-billing__active_mist__mobile.png']
docs += ['QAM/HANDOFFS/COMBINED_RETEST_001_IDENTITY_STOP.md','EVIDENCE/REPAIR_001_ENGINEERING_REPORT.md','EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md']
docs += ['QAM/HANDOFFS/REPAIR_002_RETEST_001_IDENTITY_STOP.md','EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md','EVIDENCE/FINAL_CANDIDATE_PREPARATION_001.md','EVIDENCE/FINAL_CANDIDATE_PREPARATION_001.json','EVIDENCE/REPAIR_002/addendum_002/SCENARIO_RESULTS.md']
docs += ['EVIDENCE/REPAIR_003_ENGINEERING_REPORT.md','EVIDENCE/REPAIR_003/BEFORE_AFTER.md','EVIDENCE/REPAIR_003/CLEANUP_AND_LIMITATIONS.md']
files=[p/n for n in docs]
for root in [e,q/'AUTOMATION/repair003']:
 files += [f for f in root.rglob('*') if f.is_file() and f.suffix in {'.md','.txt','.json','.jsonl','.log','.png','.ts','.cjs','.py','.diff'} and f.name not in ['privacy-validation.json']]
assert len(files)==len(set(files))
# Source values consumed in memory only. No value hashes retained.
code="const fs=require('fs'),d=require('dotenv');let a=[];for(const p of ['.env.qa.local','.env.local'])a.push(...Object.values(d.parse(fs.readFileSync(p))));process.stdout.write(JSON.stringify(a));"
values=[v.encode() for v in json.loads(subprocess.check_output(['node','-e',code],cwd=r)) if len(v)>=8]
def scan(b,vs):return any(v in b for v in vs) or bool(re.search(rb'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+',b))
fixture=b'SYNTHETIC_QA_LEAK_CONTROL_123';controls={'syntheticValueLeakDetected':scan(b'prefix '+fixture,[fixture]),'cleanAccepted':not scan(b'clean safe fixture',[fixture]),'syntheticJWTDetected':scan(b'eyJ'+b'a'*24+b'.'+b'b'*24+b'.'+b'c'*24,[])};assert all(controls.values())
for f in files:
 if scan(f.read_bytes(),values):raise RuntimeError('Privacy scan failed at '+str(f.relative_to(p))+'; sensitive value suppressed')
privacy={'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'controls':controls,'scannedPaths':[str(f.relative_to(p)) for f in files],'selectedValueScan':'PASS','expandedArchiveValueScan':'required and asserted by same helper before receipt','imageReview':'Five selected images visually inspected: two public synthetic failure images and three direct Chrome actual-zoom/focus frames. Reference image synthetic; no real sign-ins in this run. Byte scanning alone does not OCR images.','excluded':'env files, auth state, profiles, node_modules, builds, raw automatic error contexts, Git internals, previous ZIPs','valuesOrValueHashesRetained':False}
(e/'privacy-validation.json').write_text(json.dumps(privacy,indent=2));files.append(e/'privacy-validation.json')
entries={str(f.relative_to(p)):f.read_bytes() for f in files}
index={'module':'FFM-ABM-001-SUBSCRIPTION-PORTAL','phase':'REPAIR_003_RETEST_001','base_sha':sha,'snapshot_manifest_sha256':manifest_hash,'candidate':'snapshot:'+manifest_hash,'plan_sha256':ph,'files':[{'path':n,'source':str(p/n),'purpose':'REPAIR_003 snapshot retest evidence/helper or governing/historical review input','size_bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for n,b in sorted(entries.items())]}
entries['FILE_INDEX.json']=json.dumps(index,indent=2).encode()
z=q/'HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_003_RETEST_001_REVIEW.zip'
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as a:
 for n,b in entries.items():a.writestr(n,b)
with zipfile.ZipFile(z) as a:
 assert a.testzip() is None;assert len(a.namelist())==len(set(a.namelist()))==len(entries);assert set(a.namelist())==set(entries)
 for n in a.namelist():
  assert not n.startswith('/') and '..' not in Path(n).parts;assert not scan(a.read(n),values)
 for row in index['files']:
  b=a.read(row['path']);assert len(b)==row['size_bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
d=Path('/home/moose/Downloads')/z.name;shutil.copyfile(z,d);assert z.read_bytes()==d.read_bytes()
receipt={'base_sha':sha,'snapshot_manifest_sha256':manifest_hash,'candidate':'snapshot:'+manifest_hash,'plan_sha256':ph,'canonical':str(z),'downloads':str(d),'file_count':len(entries),'zip_sha256':hashlib.sha256(z.read_bytes()).hexdigest(),'integrityAndIndexVerified':True,'selectedAndExpandedArchivePrivacyScan':'PASS','downloadsIdentical':True}
(q/'HANDOFFS/REPAIR_003_RETEST_001_RECEIPT.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt,indent=2))
