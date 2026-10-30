from pathlib import Path
import hashlib,json,subprocess,sys
repo=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1')
manifest=repo/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/QAM/evidence/repair002/snapshot-input-manifest.json'
assert hashlib.sha256(manifest.read_bytes()).hexdigest()=='cc3518f797df96edb2f48e6127b869869d0f80c9d6d01b878bdd0c1a0175213a'
sha=subprocess.check_output(['git','rev-parse',sys.argv[1] if len(sys.argv)>1 else 'HEAD'],cwd=repo,text=True).strip()
rows=json.loads(manifest.read_text())['files'];bad=[]
for row in rows:
 p=subprocess.run(['git','show',sha+':'+row['path']],cwd=repo,capture_output=True)
 if p.returncode or hashlib.sha256(p.stdout).hexdigest()!=row['sha256']:bad.append(row['path'])
tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',sha],cwd=repo,text=True).splitlines()
inputs={n for n in tracked if n.startswith(('src/','e2e/','public/')) or '/' not in n and not n.endswith('.md') and not n.startswith('.env')}
extra=sorted(inputs-{x['path'] for x in rows})
print(json.dumps({'commit':sha,'manifestSHA256':'cc3518f797df96edb2f48e6127b869869d0f80c9d6d01b878bdd0c1a0175213a','mismatchedOrMissing':bad,'additionalInputs':extra,'match':not bad and not extra,'certificationGranted':False},indent=2))
sys.exit(bool(bad or extra))
