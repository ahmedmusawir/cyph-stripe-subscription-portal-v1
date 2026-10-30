from pathlib import Path
import hashlib,json,subprocess,sys
repo=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1')
manifest=repo/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/QAM/evidence/repair003/snapshot-input-manifest.json'
assert hashlib.sha256(manifest.read_bytes()).hexdigest()=='61a39c96c5162cc36e027d852affeca76fcc82617c631121c3c0870af63bf502'
sha=subprocess.check_output(['git','rev-parse',sys.argv[1] if len(sys.argv)>1 else 'HEAD'],cwd=repo,text=True).strip()
rows=json.loads(manifest.read_text())['files'];bad=[]
for row in rows:
 p=subprocess.run(['git','show',sha+':'+row['path']],cwd=repo,capture_output=True)
 if p.returncode or hashlib.sha256(p.stdout).hexdigest()!=row['sha256']:bad.append(row['path'])
tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',sha],cwd=repo,text=True).splitlines()
inputs={n for n in tracked if n.startswith(('src/','e2e/','public/')) or '/' not in n and not n.endswith('.md') and not n.startswith('.env')}
extra=sorted(inputs-{x['path'] for x in rows})
print(json.dumps({'commit':sha,'manifestSHA256':'61a39c96c5162cc36e027d852affeca76fcc82617c631121c3c0870af63bf502','mismatchedOrMissing':bad,'additionalInputs':extra,'match':not bad and not extra,'certificationGranted':False},indent=2))
sys.exit(bool(bad or extra))
