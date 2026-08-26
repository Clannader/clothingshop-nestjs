// oauth2RedirectUrl(即发起授权时的redirect_uri)必须按浏览器当前访问origin动态生成:启动时无法预知
// 浏览器会用localhost/IP/域名哪种方式访问,而swaggerOptions是启动时静态序列化进swagger-ui-init.js的
// (patchDocumentOnRequest钩子只能改document,改不了swaggerOptions),故用customJsStr内联脚本在浏览器端
// 包装window.SwaggerUIBundle来动态注入:customJsStr渲染在swagger-ui-init.js之后,但init.js的执行体包在
// window.onload回调里(异步),该同步脚本必然先于onload执行,此时替换SwaggerUIBundle即可赶在真正初始化前
// 注入oauth2RedirectUrl;另外init.js在调用SwaggerUIBundle(opts)前还会读取其presets/plugins两个静态属性,
// 包装函数必须透传,否则页面初始化直接报错;脚本里的/swagger-ui前缀需与SwaggerModule.setup第一个参数
// 保持一致(回调页由@nestjs/swagger把swagger-ui-dist整目录静态挂载在该前缀下自动提供)
(function () {
  const orig = window.SwaggerUIBundle;
  if (typeof orig !== 'function') { return; }
  function SwaggerUiRedirectOverride(opts) {
    opts = opts || {};
    opts.oauth2RedirectUrl =
      window.location.origin + '/swagger-ui/oauth2-redirect.html';
    return orig(opts);
  }
  SwaggerUiRedirectOverride.presets = orig.presets;
  SwaggerUiRedirectOverride.plugins = orig.plugins;
  window.SwaggerUIBundle = SwaggerUiRedirectOverride;
})();