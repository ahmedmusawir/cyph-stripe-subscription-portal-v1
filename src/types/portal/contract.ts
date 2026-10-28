// Portal FFM contract — copied from the module's _project/portal-contract.ts (v1.1).
// Pure types; no SDK/runtime implementation. Field meanings are owned by DATA_CONTRACT.
export type Cents = number; // Integer, >=0; validate at mock-service boundary.
export type ISODate = string;
export type Persona = 'prospective_owner' | 'billing_owner' | 'store_admin' | 'member';
export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'cancel_scheduled' | 'canceled';
export type StoreStatus = 'draft' | 'payment_pending' | 'provisioning' | 'active' | 'attention';
export type InvitationStatus = 'not_required' | 'pending' | 'accepted' | 'expired' | 'held';
export type QuoteStatus = 'loading' | 'ready' | 'expired' | 'error';
export interface Capabilities { canViewBilling: boolean; canManageBilling: boolean; canAddStore: boolean }
export interface PortalSessionView extends Capabilities {
 signedIn: boolean; displayName: string; persona: Persona; accountId?: string; isDemo: true;
}
export interface PlanView {
 id: string; name: string; interval: 'month'; includedStoreCount: number;
 baseAmountCents?: Cents; additionalStoreAmountCents?: Cents;
 benefits: string[]; commercialStatus: 'provisional' | 'approved';
}
export interface OwnerDraft {
 firstName: string; lastName: string; email: string; mobile: string;
 businessRole: 'owner' | 'pharmacist_in_charge' | 'manager' | 'other'; legalBusinessName?: string;
}
export type AdminAssignment = {kind:'owner'} | {kind:'other'; fullName:string; email:string};
export interface PharmacyDraft {
 id:string; name:string; street:string; city:string; state:string; zip:string;
 ncpdp:string; npi:string; phone:string; software:'Liberty'|'Pioneer'|'Other';
 softwareOther?:string; adminAssignment:AdminAssignment;
}
export interface ConsentView {
 termsAccepted:boolean; recurringChargeAccepted:boolean; priceChangeAccepted:boolean;
 documentVersionLabel?:string; acceptedQuoteId?:string;
}
export type RegistrationState = 'editing'|'ready_for_checkout'|'checkout_pending'|'payment_confirmed'|'provisioning'|'access_email_ready'|'abandoned';
export interface RegistrationDraft {
 id:string; revision:number; planId:string; requestedStoreCount:number;
 owner:Partial<OwnerDraft>; pharmacies:Partial<PharmacyDraft>[]; code?:string;
 consents:ConsentView; state:RegistrationState; resumeAvailable:boolean;
}
export interface SubscriptionView {
 planName:string; status:SubscriptionStatus; coveredStoreCount:number;
 monthlyAmountCents?:Cents; nextPaymentAt?:ISODate; cancelAtPeriodEnd?:boolean;
 accessEndsAt?:ISODate; billingIssue?:string;
}
export interface PharmacyView {
 id:string; name:string; ncpdpDisplay:string; adminName:string;
 activationStatus:StoreStatus; invitationStatus:InvitationStatus;
 isIncluded:boolean; monthlyAmountCents?:Cents;
}
export interface BillingAccountView {
 id:string; ownerName:string; ownerEmail:string; subscription:SubscriptionView;
 pharmacies:PharmacyView[]; permissions:Capabilities;
}
export interface QuoteView {
 id:string; draftRevision:number; kind:'initial'|'add_store'; status:QuoteStatus;
 currentStoreCount:number; proposedStoreCount:number; currentRecurringCents:Cents;
 newRecurringCents:Cents; prorationCents:Cents; discountCents:Cents;
 taxCents?:Cents; dueNowCents?:Cents; currency:'USD'; effectiveAt?:ISODate;
 expiresAt?:ISODate; isIllustrative:true;
}
export interface ActivationView {
 paymentState:'pending'|'confirmed'|'failed'|'unknown';
 provisioningState:'not_started'|'pending'|'ready'|'attention';
 emailState:'not_started'|'pending'|'sent'|'failed'; ownerEmailMasked:string;
 retryAvailable:boolean; supportMessage?:string;
}
export interface InvitationView {
 pharmacyId:string; recipientName:string; recipientEmailMasked:string;
 status:InvitationStatus; deliveryState:'not_sent'|'pending'|'sent'|'failed';
}
export type ReturnContext = 'registration_review'|'activation'|'account_billing'|'add_store_confirm'|'owedbook_reference';
export interface HandoffView {
 destination:'stripe_checkout'|'stripe_portal'|'owedbook'|'account_setup';
 purpose:string; returnContext:ReturnContext; isDemo:true; operationId?:string;
 status:'loading'|'ready'|'returning'|'error';
}
export interface AccessEmailView {
 recipientKind:'owner'|'store_admin'; recipientName:string; recipientEmailMasked:string;
 pharmacyNames:string[]; subject:string; linkState:'valid'|'expired'|'used'; expiryLabel:string;
}
export type ErrorCode = 'validation'|'denied'|'duplicate'|'quote_expired'|'quote_unavailable'|'conflict'|'missing_context';
export type Result<T> = {ok:true; value:T} | {ok:false; code:ErrorCode; message:string; fieldErrors?:Record<string,string>};
export interface OperationView {
 id:string; operationKey:string; state:'pending'|'unknown'|'failed'|'paid_provisioning'|'attention'|'succeeded';
 pharmacyId?:string; activation:ActivationView;
}
export interface AccountAccessDenied {kind:'denied'; ownerContactLabel:string}
export type AccountRead = {kind:'account'; account:BillingAccountView} | AccountAccessDenied;
export interface AddStoreDraft {id:string; revision:number; pharmacy:Partial<PharmacyDraft>; consents:ConsentView}
export interface PortalServices {
 getSession():Promise<PortalSessionView>;
 loadAccount():Promise<Result<AccountRead>>;
 getRegistrationDraft():Promise<RegistrationDraft>;
 saveRegistrationDraft(input:RegistrationDraft):Promise<Result<RegistrationDraft>>;
 getAddStoreDraft():Promise<AddStoreDraft>;
 saveAddStoreDraft(input:AddStoreDraft):Promise<Result<AddStoreDraft>>;
 requestQuote(input:{kind:'initial'|'add_store'; draftId:string; draftRevision:number}):Promise<Result<QuoteView>>;
 applyCode(input:{draftId:string; code:string}):Promise<Result<QuoteView>>;
 startCheckout(input:{draftId:string; quoteId:string; consents:ConsentView; operationKey:string}):Promise<Result<HandoffView>>;
 readActivation(operationId:string):Promise<Result<ActivationView>>;
 requestAccessEmailPreview(contextId:string):Promise<Result<{status:'request_received'|'retry'; email?:AccessEmailView}>>;
 confirmAddStore(input:{draftId:string; quoteId:string; consents:ConsentView; operationKey:string}):Promise<Result<OperationView>>;
 readOperation(operationId:string):Promise<Result<OperationView>>;
 openBillingPreview(purpose:'manage'|'cancel'|'resume'|'change_card'|'invoices'):Promise<Result<HandoffView>>;
 refreshAfterHandoff(context:ReturnContext):Promise<Result<AccountRead>>;
}
// Separate mock-only harness interface; never a production auth control.
export interface DemoHarness {
 selectScenario(id:string):Promise<void>;
 selectPersona(persona:Persona):Promise<void>;
 resolveOperation(id:string,outcome:'failed'|'unknown'|'paid_provisioning'|'attention'|'succeeded'):Promise<void>;
 reset():Promise<void>;
}
