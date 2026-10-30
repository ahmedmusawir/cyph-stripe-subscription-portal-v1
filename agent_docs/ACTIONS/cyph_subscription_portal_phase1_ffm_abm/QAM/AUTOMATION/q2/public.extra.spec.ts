import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {setTheme,measure,assertGate} from './gate-m';
import {contrast} from './qa-metrics';
const key='cyph-portal-demo:v1:public';
function record(x:any){fs.appendFileSync('/tmp/cody-q2-extra.jsonl',JSON.stringify(x)+'\n')}
async function seed(page:any,id:string){await page.goto('/demo/register/plan');await page.locator('summary',{hasText:'Demo controls'}).click();await page.locator('#demo-reg-scenario').selectOption(id);await page.getByRole('button',{name:'Load',exact:true}).click();await page.waitForLoadState('networkidle');}
test('T04/T29 all public scenarios both themes and state-specific surfaces',async({page})=>{
 test.setTimeout(180000);
 const ids=['fresh','prefilled_one_store','prefilled_two_store','prefilled_three_store','quote_unavailable','checkout_abandoned','checkout_declined','checkout_unknown','checkout_expired','activation_waiting','activation_provisioning','activation_delayed','activation_email_failed','activation_payment_failed','activation_ready','link_expired','link_used','link_request_error'];
 for(const theme of ['light','dark'] as const)for(const id of ids){await seed(page,id);await setTheme(page,theme);await page.setViewportSize({width:375,height:900});const s=await page.evaluate(k=>JSON.parse(sessionStorage.getItem(k)!).state.s,key);expect(s.scenario).toBe(id);await expect(page.locator('h1')).toBeVisible();const geometry=await measure(page,new URL(page.url()).pathname,375,theme);record({id,theme,geometry,contrast:await contrast(page)});assertGate(geometry);}
});
test('T09/T29 public clock expires quote immediately and refresh clears consent',async({page})=>{
 await seed(page,'prefilled_two_store');await expect(page.getByTestId('due-today')).toHaveText('$148.00');await page.locator('#c1').check();await page.locator('#c2').check();
 const before=await page.evaluate(k=>JSON.parse(sessionStorage.getItem(k)!).state.s.clockOffsetMs,key);
 if(!await page.locator('details[open]').count())await page.locator('summary',{hasText:'Demo controls'}).click();
 await page.getByRole('button',{name:'Advance 31 minutes'}).click();const after=await page.evaluate(k=>JSON.parse(sessionStorage.getItem(k)!).state.s.clockOffsetMs,key);expect(after-before).toBe(1860000);await expect(page.getByText('Your quote expired',{exact:true})).toBeVisible();await expect(page.getByTestId('continue-payment')).toBeDisabled();record({id:'public-clock',delta:after-before,expiredVisible:true});
 await page.getByRole('button',{name:'Refresh quote',exact:true}).click();await expect(page.getByTestId('due-today')).toHaveText('$148.00');await expect(page.locator('#c1')).not.toBeChecked();await expect(page.locator('#c2')).not.toBeChecked();
});
test('T23 focused and hovered rendered contrast plus error states',async({page})=>{
 for(const theme of ['light','dark'] as const){await page.goto('/demo/register/owner');await setTheme(page,theme);await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByTestId('error-summary')).toBeFocused();record({id:'owner-errors',theme,contrast:await contrast(page)});const link=page.locator('a.portal-link').first();await link.hover();record({id:'hover',theme,contrast:await contrast(page)});await link.focus();record({id:'focus',theme,contrast:await contrast(page)});}
});
