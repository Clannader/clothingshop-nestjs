// 日期格式化格式
export const dateSdf = 'YYYY-MM-DD HH:mm:ss';
// 语言类型
export const ZH = 'ZH';
export const EN = 'EN';
// Session过期时间,这里的过期时间要重新定义,不是自己定义的session过期时间,而是Mongodb Session过期时间
export const DbSession_Expires = 60 * 60; // 1小时,单位秒,其实现在这个就是session失效的时间
export const Session_Expires = 60 * 60 * 1000; // 1小时,单位毫秒
export const Active_Expires = 10 * 60 * 1000; // 用户活跃时间
export const Cookie_Expires = 7 * 24 * 60 * 60 * 1000; // 7天
export const Cache_Expires = 10 * 60 * 1000; // 缓存失效时间
export const Supervisor_Rights = ['SUPERVISOR']; // Supervisor权限
export const userNameExp = /^[\w_\-\$\@\.]+$/; // 中文正则\u4e00-\u9fa5
export const saveUserNameExp = /^[\w_\-\$]+$/; // 保存用户名时的正则,不能含有@
export const groupCodeExp = /^[A-Za-z]+$/;
export const mailExp = /^[\w\.\-]+@[\w]+((\.[\w]{2,10}){1,5})$/;
export const nameExp = /^[\w\u4e00-\u9fa5]+$/;
export const codeExp = /^[\w]+$/;
export const rightsExp =
  /^(\-?([1-9]{1}\d{3}|[A-Za-z]{2,15}),)*(?=(\-?([1-9]{1}\d{3}|[A-Za-z]{2,15}))$)/;
export const ipExp =
  /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/;
export const timeZoneExp = /^[+\-]([01][0-9]|2[0-4]):([0-5][0-9])$/;
export const configKeyExp = /^[A-Z][\w]{1,9}$/;
export const passwordExp = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,}$/; // 必须包含数字大小写字母特殊符合大于等于8位的密码
// export const passwordExp2 = /^(?=.*\d.*)(?=.*[A-Z].*)(?=.*[a-z].*)(?=.*\W.*).{8,}$/; // 密码规则的另一种写法
export const sessionName = 'cmsApp';
export const sessionSecret = '123456cms';
export const interfaceHeader = 'CMS-Interface';
export const tripleDES = {
  // 这个应该改成使用sessionid来做key,位数不足使用0补齐
  key: 'ClothingShopClothingShopClothingShopClothingShopClothingShopAAAA',
  iv: '8890880',
};
export const baseUrl = '/index';
export const loginUrl = '/cms/api/user/login';
export const logoutUrl = '/cms/api/user/logout';
// 以下常量抄自@nest/swagger,因为要使用泛型,需要修改里面的内置元数据的值
export const API_MODEL_PROPERTIES = 'swagger/apiModelProperties';
export const API_MODEL_PROPERTIES_ARRAY = 'swagger/apiModelPropertiesArray';
export const SECRET_CONFIG = 'SECRET_CONFIG';
export const GLOBAL_CONFIG = 'GLOBAL_CONFIG';
export const WRITE_LOG = Symbol('WriteLog'); // 写日志修饰器Key
