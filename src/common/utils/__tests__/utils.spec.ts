import { Utils } from '@/common/utils';
import { RightsEnum } from '@/rights';
import { userRightsCodeExp, userRightsGroupExp } from '@/common';

describe('Utils', () => {
  it('32位系统路径转义', () => {
    expect(Utils.escapePath('/src/config\\configService\\index')).toBe(
      '\\src\\config\\configService\\index',
    );
  });

  // it('64位系统路径转义', () => {
  //   expect(Utils.escapePath('/src/config\configService\index')).toBe('/src/config/configService/index');
  // });

  it('特殊字符转义', () => {
    expect(Utils.escapeString('src\\')).toBe('src\\\\');
    // 这里的\[相当于[,而不是\和[
    expect(Utils.escapeString('src[config]$ini')).toBe('src\\[config\\]\\$ini');
    expect(Utils.escapeString('src.')).toBe('src\\.');
    expect(Utils.escapeString('src*')).toBe('src\\*');
    expect(Utils.escapeString('src+')).toBe('src\\+');
    expect(Utils.escapeString('src?')).toBe('src\\?');
    expect(Utils.escapeString('src^')).toBe('src\\^');
    expect(Utils.escapeString('src..**++')).toBe('src\\.\\.\\*\\*\\+\\+');
    expect(Utils.escapeString('src[]')).toBe('src\\[\\]');
    expect(Utils.escapeString('src//')).toBe('src\\/\\/');
    expect(Utils.escapeString('src/[config]/$ini')).toBe(
      'src\\/\\[config\\]\\/\\$ini',
    );
    expect(Utils.escapeString('src=!${}()|')).toBe(
      'src\\=\\!\\$\\{\\}\\(\\)\\|',
    );
  });

  it('md5加密 "a"', () => {
    expect(Utils.md5('a')).toBe('0cc175b9c0f1b6a831c399e269772661');
  });

  it('sha1加密 "a"', () => {
    expect(Utils.sha1('a')).toBe('86f7e437faa5a7fce15d1ddcb9eaeaea377667b8');
  });

  it('sha256加密 "a"', () => {
    expect(Utils.sha256('a')).toBe(
      'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    );
  });

  it('3DES加解密 "a"', () => {
    const encrypt = Utils.tripleDesEncrypt('a');
    expect(Utils.tripleDesDecrypt(encrypt)).toBe('a');

    const key =
      'ClothingShopClothingShopClothingShopClothingShopClothingShopBBBB';
    const encrypt2 = Utils.tripleDesEncrypt('a', key);
    expect(Utils.tripleDesDecrypt(encrypt2, key)).toBe('a');
  });

  it('base64加解密 "a"', () => {
    const base64 = Utils.stringToBase64('a');
    expect(Utils.base64ToString(base64)).toBe('a');
  });

  it('文件大小测试', () => {
    expect(Utils.getFileSize(256)).toBe('256.00B');
    expect(Utils.getFileSize(256 * 1024)).toBe('256.00KB');
    expect(Utils.getFileSize(256 * 1024 * 1024)).toBe('256.00MB');
    expect(Utils.getFileSize(256 * 1024 * 1024 * 1024)).toBe('256.00GB');
    expect(Utils.getFileSize(256 * 1024 * 1024 * 1024 * 1024)).toBe('256.00TB');

    expect(Utils.getFileSize(1.256 * 1024, 3)).toBe('1.256KB');
    expect(Utils.getFileSize(1.256 * 1024, 2)).toBe('1.26KB');
    expect(Utils.getFileSize(1.26 * 1024, 2)).toBe('1.26KB');
    expect(Utils.getFileSize(1.26 * 1024, 1)).toBe('1.3KB');
    expect(Utils.getFileSize(1.22 * 1024, 1)).toBe('1.2KB');
    expect(Utils.getFileSize(1.233 * 1024 * 1024, 2)).toBe('1.23MB');
    expect(Utils.getFileSize(1.71 * 1024 * 1024 * 1024, 1)).toBe('1.7GB');
  });

  it('测试替换参数JSON', () => {
    expect(Utils.replaceArgsFromJson('AA')).toBe('AA');
    expect(Utils.replaceArgsFromJson('AA', { msg: 'BB' })).toBe('AA');
    expect(Utils.replaceArgsFromJson('AA{msg}')).toBe('AA{msg}');
    expect(Utils.replaceArgsFromJson('AA{msg}', { msg: 'BB' })).toBe('AABB');
    expect(Utils.replaceArgsFromJson('AA{msg}', { msg2: 'BB' })).toBe(
      'AA{msg}',
    );
    expect(
      Utils.replaceArgsFromJson('AA{msg}BB{msg2}', { msg: 'CC', msg2: 'OO' }),
    ).toBe('AACCBBOO');
    expect(
      Utils.replaceArgsFromJson('AA{msg.age}', { msg: { age: 'BB' } }),
    ).toBe('AABB');
    expect(
      Utils.replaceArgsFromJson('AA{msg.age}', { msg2: { age: 'BB' } }),
    ).toBe('AA{msg.age}');
    expect(
      Utils.replaceArgsFromJson('AA{msg[0].age}', { msg: [{ age: 'BB' }] }),
    ).toBe('AABB');
    expect(
      Utils.replaceArgsFromJson('AA{msg[0].age}BB{msg[1].age}', {
        msg: [{ age: 'BB' }, { age: 'CC' }],
      }),
    ).toBe('AABBBBCC');

    const newReg = /\$\{[A-Za-z0-9\.\[\]]+\}/g;

    expect(
      Utils.replaceArgsFromJson(
        'My name is ${myName}',
        { myName: 'oliver' },
        newReg,
      ),
    ).toBe('My name is oliver');

    expect(
      Utils.replaceArgsFromJson(
        'My name is ${myName}, 年龄是: ${info.age}',
        { myName: 'oliver', info: { age: 28 } },
        newReg,
      ),
    ).toBe('My name is oliver, 年龄是: 28');

    expect(
      Utils.replaceArgsFromJson(
        'My name is ${myName}, 年龄是: ${info.age}',
        { myName2: 'oliver', info2: { age: 28 } },
        newReg,
      ),
    ).toBe('My name is ${myName}, 年龄是: ${info.age}');
  });

  it('测试判空', () => {
    expect(Utils.isEmpty(null)).toBe(true);
    expect(Utils.isEmpty('   ')).toBe(true);
    expect(Utils.isEmpty(undefined)).toBe(true);
    expect(Utils.isEmpty('  undefined  ')).toBe(true);
    expect(Utils.isEmpty('test')).toBe(false);
    expect(Utils.isEmpty([])).toBe(true);
    expect(Utils.isEmpty(123)).toBe(false);
    expect(Utils.isEmpty({})).toBe(false);

    expect(Utils.isEmpty(null, true)).toBe(true);
    expect(Utils.isEmpty('', true)).toBe(false);
    expect(Utils.isEmpty(undefined, true)).toBe(true);
    expect(Utils.isEmpty('  undefined  ', true)).toBe(true);
    expect(Utils.isEmpty('test', true)).toBe(false);
    expect(Utils.isEmpty([], true)).toBe(true);
    expect(Utils.isEmpty(123, true)).toBe(false);
    expect(Utils.isEmpty(0)).toBe(false);
    expect(Utils.isEmpty({}, true)).toBe(false);

    const map = new Map();
    expect(Utils.isEmpty(map)).toBe(true);
    map.set('aa', 123);
    expect(Utils.isEmpty(map)).toBe(false);

    const set = new Set();
    expect(Utils.isEmpty(set)).toBe(true);
    set.add('222');
    expect(Utils.isEmpty(set)).toBe(false);
  });

  it('测试 piiData方法', () => {
    expect(Utils.piiData('1')).toBe('******');
    expect(Utils.piiData('12')).toBe('******');
    expect(Utils.piiData('123')).toBe('1******3');
    expect(Utils.piiData('12345')).toBe('1******5');
    expect(Utils.piiData('123456')).toBe('123******456');
    expect(Utils.piiData('123456789')).toBe('123******789');
    expect(Utils.piiData('1234567890321', 5)).toBe('12345******321');
    expect(Utils.piiData('12345678903243324431', 6, 4)).toBe(
      '123456******4431',
    );
  });

  it('测试 piiXmlData方法', () => {
    const xml =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <heading>Reminder not is found</heading>\n' +
      '    <body>1234567890</body>\n' +
      '</note>';
    const pii =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <heading>Rem******und</heading>\n' +
      '    <body>123******890</body>\n' +
      '</note>';
    expect(Utils.piiXmlData(xml, 'heading', 'body')).toBe(pii);

    const xml2 =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <q12:heading xmls:q12="xxxxxxx">Reminder not is found</q12:heading>\n' +
      '    <q13:body>1234567890</q13:body>\n' +
      '</note>';
    const pii2 =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <q12:heading xmls:q12="xxxxxxx">Rem******und</q12:heading>\n' +
      '    <q13:body>123******890</q13:body>\n' +
      '</note>';
    expect(Utils.piiXmlData(xml2, 'heading', 'body')).toBe(pii2);

    const xml3 =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <heading>Reminder not is found</heading>\n' +
      '    <bodyooo>43434234234</bodyooo>\n' +
      '    <body>1234567890</body>\n' +
      '</note>';
    const pii3 =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <heading>Rem******und</heading>\n' +
      '    <bodyooo>43434234234</bodyooo>\n' +
      '    <body>123******890</body>\n' +
      '</note>';
    expect(Utils.piiXmlData(xml3, 'heading', 'body')).toBe(pii3);

    const xml4 =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <heading>\n' +
      '        <user>34234343</user>\n' +
      '        <pass>ffdfdfdsfd</pass>\n' +
      '    </heading>\n' +
      '    <bodyooo>43434234234</bodyooo>\n' +
      "    <body>Don't forget the meeting!</body>\n" +
      '</note>';
    const pii4 =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<note>\n' +
      '    <to>George</to>\n' +
      '    <from>John</from>\n' +
      '    <heading>\n' +
      '        <user>342******343</user>\n' +
      '        <pass>ffdfdfdsfd</pass>\n' +
      '    </heading>\n' +
      '    <bodyooo>43434234234</bodyooo>\n' +
      '    <body>Don******ng!</body>\n' +
      '</note>';
    expect(Utils.piiXmlData(xml4, 'user', 'body')).toBe(pii4);
  });

  it('测试 piiJsonData方法', () => {
    const jsonData = {
      userName: 'zhangsan',
      address: '通天塔135路1号拐角左侧门',
      rooms: [
        {
          roomNumber: 120,
          address: '通天塔120路1号',
          info: '哈哈我乱写的',
        },
        {
          roomNumber: 123,
          address: '通天塔123路3号',
          info: '电视剧里面的FFF',
        },
      ],
      password: '1234567',
      info: {
        address: '原五象大厦世纪路136路2号右拐门',
        userName: 'lisinihaoa',
      },
      token: '568994451',
      picture: '图片',
      picture2: '图片片',
      picture3: '图片好看',
      picture4: '图',
    };
    expect(Utils.piiJsonData(jsonData, 'picture').picture).toBe('******');
    expect(Utils.piiJsonData(jsonData, 'picture2').picture2).toBe('图******片');
    expect(Utils.piiJsonData(jsonData, 'picture3').picture3).toBe('图******看');
    expect(Utils.piiJsonData(jsonData, 'picture4').picture4).toBe('******');
    expect(Utils.piiJsonData(jsonData, 'token').token).toBe('568******451');

    const p1 = Utils.piiJsonData(jsonData, 'token', 'password');
    expect(p1.token).toBe('568******451');
    expect(p1.password).toBe('123******567');

    const p2 = Utils.piiJsonData(jsonData, 'userName', 'password');
    expect(p2.token).toBe('568994451');
    expect(p2.password).toBe('123******567');
    expect(p2.userName).toBe('zha******san');
    expect(p2.info.userName).toBe('lis******aoa');

    const p3 = Utils.piiJsonData(jsonData, 'userName', 'password', 'address');
    expect(p3.token).toBe('568994451');
    expect(p3.password).toBe('123******567');
    expect(p3.userName).toBe('zha******san');
    expect(p3.info.userName).toBe('lis******aoa');
    expect(p3.address).toBe('通天塔******左侧门');
    expect(p3.info.address).toBe('原五象******右拐门');
    expect(p3.rooms[0].address).toBe('通天塔******路1号');
    expect(p3.rooms[1].address).toBe('通天塔******路3号');

    const p4 = Utils.piiJsonData(jsonData, 'info');
    expect(p4.rooms[0].info).toBe('哈哈我******乱写的');
    expect(p4.rooms[1].info).toBe('电视剧******FFF');
    expect(p4.info).toStrictEqual({
      address: '原五象大厦世纪路136路2号右拐门',
      userName: 'lisinihaoa',
    });

    const p5 = Utils.piiJsonData(
      jsonData,
      'info.userName',
      'token',
      'rooms[1].address',
    );
    expect(p5.info.userName).toBe('lis******aoa');
    expect(p5.userName).toBe('zhangsan');
    expect(p5.token).toBe('568******451');
    expect(p5.rooms[1].address).toBe('通天塔******路3号');
    expect(p5.rooms[0].address).toBe('通天塔120路1号');
  });

  // it('测试判断权限是否正确判断返回', () => {
  //   const session1 = {
  //     rights: [],
  //   };
  //   const session2 = {
  //     rights: [RightsEnum.OtherSetup],
  //   };
  //   const session3 = {
  //     rights: [
  //       RightsEnum.OtherSetup,
  //       RightsEnum.ConfigModify,
  //       RightsEnum.ConfigDelete,
  //     ],
  //   };
  //   expect(Utils.hasRights(session1, RightsEnum.OtherSetup)).toBe(false);
  //   expect(Utils.hasRights(session2, RightsEnum.OtherSetup)).toBe(true);
  //   expect(Utils.hasRights(session2, RightsEnum.RightsCodeModify)).toBe(false);
  //   expect(Utils.hasRights(session3, RightsEnum.OtherSetup)).toBe(true);
  //   expect(
  //     Utils.hasRights(session3, RightsEnum.OtherSetup, RightsEnum.ConfigModify),
  //   ).toBe(true);
  //   expect(Utils.hasRights(session3, RightsEnum.RightsCodeModify)).toBe(false);
  // });

  it('测试权限组正则验证', () => {
    const expFun = (regExp: RegExp) => {
      expect(regExp.test('')).toBe(false);
      expect(regExp.test('1')).toBe(false);
      expect(regExp.test('12')).toBe(false);
      expect(regExp.test('123')).toBe(false);
      expect(regExp.test('1234')).toBe(true);
      expect(regExp.test('12345')).toBe(true);
      expect(regExp.test('123456')).toBe(false);
      expect(regExp.test('w')).toBe(false);
      expect(regExp.test('wy')).toBe(true);
      expect(regExp.test('wyi')).toBe(true);
      expect(regExp.test('wyi123')).toBe(false);
      expect(regExp.test('-')).toBe(false);
      expect(regExp.test('-1')).toBe(false);
      expect(regExp.test('-12')).toBe(false);
      expect(regExp.test('-123')).toBe(false);
      expect(regExp.test('-1234')).toBe(true);
      expect(regExp.test('-12345')).toBe(true);
      expect(regExp.test('-123456')).toBe(false);
      expect(regExp.test('-wyi123')).toBe(false);
      expect(regExp.test('-wyi')).toBe(true);
      expect(regExp.test('-w')).toBe(false);
    };
    expFun(userRightsGroupExp);
    expFun(userRightsCodeExp);
    expect(userRightsCodeExp.test('-1234,4568')).toBe(true);
    expect(userRightsCodeExp.test('-1234,qwe')).toBe(true);
    expect(userRightsCodeExp.test('1234,qwe')).toBe(true);
    expect(userRightsCodeExp.test('ert,qwe')).toBe(true);
    expect(userRightsCodeExp.test('456,qwe')).toBe(false);
    expect(userRightsCodeExp.test('456,-qwe')).toBe(false);
    expect(userRightsCodeExp.test('1456,-qwe')).toBe(true);
  });
});
