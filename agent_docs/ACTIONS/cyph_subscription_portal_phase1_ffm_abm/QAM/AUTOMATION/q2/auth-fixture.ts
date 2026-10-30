import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import dotenv from 'dotenv';
export const test=base.extend<{}, {memoryAuth:any}>({
 memoryAuth:[async({browser},use)=>{
 const c=await browser.newContext(); await c.route('**/api/auth/logout',r=>r.abort());const p=await c.newPage();
 const creds=dotenv.parse(fs.readFileSync('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1/.env.qa.local'));
 await p.goto('http://localhost:3108/login');await p.getByLabel('Work email').fill(creds.QA_PORTAL_ADMIN_EMAIL);await p.getByLabel('Password').fill(creds.QA_PORTAL_ADMIN_PASSWORD);
 fs.appendFileSync('/tmp/cody-q2-auth-count.txt','sign-in attempt\n');
 await p.getByRole('button',{name:'Sign in',exact:true}).click();await expect(p).toHaveURL(/\/dashboard$/);await expect(p.getByRole('heading',{name:'Your subscription'})).toBeVisible();
 const state=await c.storageState();await c.close();await use(state);
 },{scope:'worker'}],
 storageState:async({memoryAuth},use)=>{await use(memoryAuth);},
 context:async({browser,storageState},use)=>{const c=await browser.newContext({storageState,baseURL:'http://localhost:3108'});await c.route('**/api/auth/logout',r=>r.abort());await use(c);await c.close();}
});
