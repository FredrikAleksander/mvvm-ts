declare module "*.ejs" {
		const template: (data: any) => string;
		export default template;
}

declare module "*.json" {
    const value: any;
    export default value;
}
