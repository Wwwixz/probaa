declare module 'jsbarcode' {
	// jsbarcode ships without strict TS types in some setups; keep it permissive.
	const JsBarcode: any;
	export default JsBarcode;
}

declare module '@zxing/browser' {
	// @zxing/browser types can be missing depending on bundler/TS config.
	export const BrowserMultiFormatReader: any;
	export const BarcodeFormat: any;
	export const DecodeHintType: any;
}

