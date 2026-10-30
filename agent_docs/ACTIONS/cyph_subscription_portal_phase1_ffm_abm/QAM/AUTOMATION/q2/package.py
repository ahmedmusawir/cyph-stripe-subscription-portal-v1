from pathlib import Path
import json,hashlib,zipfile,subprocess,re,datetime,shutil
r=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1');p=r/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm';q=p/'QAM';e=q/'evidence/q2'
sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=r).decode().strip();assert sha=='94251beab08dd26d7f56f4b8f2299a1e841892c5'
ph=hashlib.sha256((q/'QAM_TEST_PLAN.md').read_bytes()).hexdigest();assert ph=='42ebdbc6ac88ddf6733416aaa0374be1cc852400a6f1679ca631891ef7ddc24d'
status=subprocess.check_output(['git','status','--short'],cwd=r).decode();(e/'identity-final.txt').write_text('HEAD '+sha+'\nPlan SHA256 '+ph+'\n'+status)
changed=subprocess.check_output(['git','diff','--name-only'],cwd=r).decode().splitlines();assert all('/QAM/' in x for x in changed)
subprocess.run(['git','check-ignore','-q','.env.qa.local'],cwd=r,check=True);assert not subprocess.check_output(['git','ls-files','.env.qa.local'],cwd=r).strip()
# Explicit selected roots and extensions; never include other QAM artifacts or nested archives.
docs=['QAM/REVIEW_START_HERE.md','QAM/QAM_ENTRY.md','QAM/QAM_STATE.md','QAM/QAM_APPROVAL.md','QAM/QAM_TEST_PLAN.md','QAM/QAM_EXECUTION_REPORT.md','QAM/AC_EVIDENCE_MATRIX.md','QAM/FINDINGS.md','QAM/QAM_CLEANUP_REPORT.md','QAM/QAM_RECON_REPORT.md','QAM/QAM_PREFLIGHT.md','QAM/QAM_RISK_REQUIREMENTS.md','QAM/QAM_MANIFEST.md','QAM/HANDOFFS/ENGINEERING_HANDOFF.md','QAM/HANDOFFS/CYPH_Q1_LEAD_DECISION_001_2026-10-28_SUPERSEDED.md','ACCEPTANCE_SPEC.md','ACCEPTANCE_LEDGER.md','RULINGS.md','_project/APP_BRIEF.md','_project/DATA_CONTRACT.md','_project/IMPLEMENTATION_CONTRACT.md','_project/UI_SPEC.md','_project/portal-contract.ts','EVIDENCE/E2_ENGINEERING_REPORT.md','EVIDENCE/E2_STALE_INSTRUCTION_CHECK.md','QAM/GOVERNING/PROVENANCE.md','QAM/GOVERNING/QAM_PLAYBOOK.md','QAM/GOVERNING/QA_PLAYBOOK.md','QAM/GOVERNING/RRM_PLAYBOOK.md','_design/approved_v1_0/renders/account-billing__active_mist__mobile.png']
files=[p/n for n in docs]
for root in [e,q/'AUTOMATION/q2']:
 files += [f for f in root.rglob('*') if f.is_file() and f.suffix in {'.md','.txt','.json','.jsonl','.log','.png','.ts','.cjs','.py'} and f.name not in ['privacy-validation.json']]
assert len(files)==len(set(files))
# Source values consumed in memory only. No value hashes retained.
code="const fs=require('fs'),d=require('dotenv');let a=[];for(const p of ['.env.qa.local','.env.local'])a.push(...Object.values(d.parse(fs.readFileSync(p))));process.stdout.write(JSON.stringify(a));"
values=[v.encode() for v in json.loads(subprocess.check_output(['node','-e',code],cwd=r)) if len(v)>=8]
def scan(b,vs):return any(v in b for v in vs) or bool(re.search(rb'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+',b))
fixture=b'SYNTHETIC_QA_LEAK_CONTROL_123';controls={'syntheticValueLeakDetected':scan(b'prefix '+fixture,[fixture]),'cleanAccepted':not scan(b'clean safe fixture',[fixture]),'syntheticJWTDetected':scan(b'eyJ'+b'a'*24+b'.'+b'b'*24+b'.'+b'c'*24,[])};assert all(controls.values())
for f in files:
 if scan(f.read_bytes(),values):raise RuntimeError('Privacy scan failed at '+str(f.relative_to(p))+'; sensitive value suppressed')
privacy={'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'controls':controls,'scannedPaths':[str(f.relative_to(p)) for f in files],'selectedValueScan':'PASS','expandedArchiveValueScan':'required and asserted by same helper before receipt','imageReview':'All four masked actual screenshots visually inspected; real identity covered; only synthetic business data visible. Reference image synthetic. Byte scanning alone does not OCR images.','excluded':'env files, auth state, profiles, node_modules, builds, raw automatic error contexts, Git internals, previous ZIPs','valuesOrValueHashesRetained':False}
(e/'privacy-validation.json').write_text(json.dumps(privacy,indent=2));files.append(e/'privacy-validation.json')
entries={str(f.relative_to(p)):f.read_bytes() for f in files}
index={'module':'FFM-ABM-001-SUBSCRIPTION-PORTAL','phase':'Q2_001','candidate':sha,'plan_sha256':ph,'files':[{'path':n,'source':str(p/n),'purpose':'Q2 evidence/helper or governing review input','size_bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for n,b in sorted(entries.items())]}
entries['FILE_INDEX.json']=json.dumps(index,indent=2).encode()
z=q/'HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_Q2_REVIEW_001.zip'
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as a:
 for n,b in entries.items():a.writestr(n,b)
with zipfile.ZipFile(z) as a:
 assert a.testzip() is None;assert len(a.namelist())==len(set(a.namelist()))==len(entries);assert set(a.namelist())==set(entries)
 for n in a.namelist():
  assert not n.startswith('/') and '..' not in Path(n).parts;assert not scan(a.read(n),values)
 for row in index['files']:
  b=a.read(row['path']);assert len(b)==row['size_bytes'] and hashlib.sha256(b).hexdigest()==row['sha256']
d=Path('/home/moose/Downloads')/z.name;shutil.copyfile(z,d);assert z.read_bytes()==d.read_bytes()
receipt={'candidate':sha,'plan_sha256':ph,'canonical':str(z),'downloads':str(d),'file_count':len(entries),'zip_sha256':hashlib.sha256(z.read_bytes()).hexdigest(),'integrityAndIndexVerified':True,'selectedAndExpandedArchivePrivacyScan':'PASS','downloadsIdentical':True}
(q/'HANDOFFS/Q2_RECEIPT.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt,indent=2))
