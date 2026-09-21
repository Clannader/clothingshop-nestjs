# Mqtt 配置说明

## 1. Mqtt 官网指标说明

Mqtt 官网上显示的 Number Of Consumers / Messages Enqueued / Messages Dequeued:

| 指标 | 含义 |
|---|---|
| Number Of Consumers | 消费者数量,表示当前有多少个消费者正在订阅该主题 |
| Messages Enqueued | 入队消息数量,表示当前有多少条消息已经被发布到该主题 |
| Messages Dequeued | 出队消息数量,表示当前有多少条消息已经被消费者接收并处理 |

示例:假设有 2 个消费者,发布了 2 条消息,那么 Number Of Consumers 为 2,Messages Enqueued 为 2,Messages Dequeued 为 4.

## 2. Mqtt 配置

### 2.1 activemq.xml — 配置 MQTT 连接的端口和 IP

```xml
<transportConnectors>
    <!-- DOS protection, limit concurrent connections to 1000 and frame size to 100MB -->
    <transportConnector name="openwire" uri="tcp://0.0.0.0:61616?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="stomp" uri="stomp://0.0.0.0:61613?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="mqtt" uri="mqtt://0.0.0.0:1883?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="http" uri="mqtt://0.0.0.0:9072?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
    <transportConnector name="ws" uri="ws://0.0.0.0:61614?maximumConnections=1000&amp;wireFormat.maxFrameSize=104857600"/>
</transportConnectors>
```

⚠️ **关键发现:`activemq.xml` 的 `<broker>` 中没有配置任何 `<plugins>` 认证插件**,因此:

- 目前 MQTT 客户端连 1883 / 9072(以及 OpenWire/AMQP/STOMP)**不需要用户名密码,可匿名连接**,且这些端口绑定在 `0.0.0.0`(对所有网卡开放)
- 以下文件目前只是**预留,并未生效**:
    - `conf\users.properties`:`admin=admin`(JAAS 用户,MQTT/消息连接用,仅MQTT网页登录用户设置)
    - `conf\groups.properties`:`admins=admin`(组 → 用户映射,配合授权插件按队列读写控制,权限组名=用户1,用户2,...)
    - `conf\login.config`:JAAS 登录入口(java 进程已通过 `-Djava.security.auth.login.config` 加载,但 broker 未挂插件所以不起作用)

**若要启用 MQTT 连接认证**,在 `activemq.xml` 的 `<broker>` 元素内加:

```xml
<plugins>
    <simpleAuthenticationPlugin>
        <users>
            <!-- groups就是订阅这个用户属于哪个权限组 -->
            <authenticationUser username="admin" password="admin" groups="admins"/>
        </users>
    </simpleAuthenticationPlugin>
    <!-- 可选:按组授权队列读写 -->
    <authorizationPlugin>
        <map>
            <authorizationMap>
                <authorizationEntries>
                    <!-- 这里应该是: 写操作=权限组名, 读操作=权限组名, 管理员权限=权限组名 -->
                    <!-- write: 向目的地发送消息(生产者权限) -->
                    <!-- read: 从目的地消费/订阅消息(消费者权限)-->
                    <!-- admin: 创建/删除目的地本身(管理权限) -->
                    <!-- queue=">" / topic=">" 是通配符匹配所有目的地,也可以用 queue="order.>" 这种前缀通配做细分授权 -->
                    <authorizationEntry queue=">" write="admins" read="admins" admin="admins"/>
                    <authorizationEntry topic=">" write="admins" read="admins" admin="admins"/>
                </authorizationEntries>
            </authorizationMap>
        </map>
    </authorizationPlugin>
</plugins>
```

```
据此:
    1. 组名 admins 的定义处:activemq.xml 内联的 groups="admins",成员是 admin(密码 admin)
    2. 组的权限:没有配置—<plugins> 里只有认证插件,没有挂 authorizationPlugin,所以没有任何授权规则.无授权规则
    = 通过认证的用户对所有目的地拥有全部权限(无限制)
    3. groups.properties 里的 admins=admin 当前不参与生效(JAAS 文件方式未被使用,它现在是摆设)
    4. 如果要启用 JAAS 方式的认证授权链路,需要把 activemq.xml 的 `<simpleAuthenticationPlugin>` 整段换成 `<jaasAuthenticationPlugin configuration="activemq"/>`,然后把账号维护到 users.properties,组维护到 groups.properties
```

```
个人理解:
  使用了simpleAuthenticationPlugin,那么就是定义某个用户在哪个组,组的权限在authorizationPlugin这里面设置
  对应的操作哪个组生效,然后用户归属哪个组,那么就可以操作什么命令
```

#### 2.1.1 groups.properties 是干嘛的

它是 **JAAS 属性登录模块(`PropertiesLoginModule`)的"组成员定义文件"**,语法就一种:

```properties
组名 = 用户1,用户2,...
```

本机文件(`conf/groups.properties`)除了 License 头只有一行有效配置:

```properties
admins=admin
```

含义:**定义一个叫 `admins` 的组,成员只有 `admin` 这一个用户**.

#### 2.1.2 它在认证授权链路中的位置

ActiveMQ broker 端(非 Web 控制台)的安全体系是"三件套 + 一个授权插件":

| 文件/配置 | 职责 | 本机现状 |
|---|---|---|
| `conf/login.config` | JAAS 入口,声明用 PropertiesLoginModule 并指向下面两个文件 | 引用 users/groups.properties |
| `conf/users.properties` | **用户 → 密码** | `admin=admin` |
| `conf/groups.properties` | **组 → 用户列表**(本文主角) | `admins=admin` |
| `conf/activemq.xml` 的 `authorizationPlugin` | **按组授权**:哪些组能读/写/管理哪些队列 | `read="admins" write="admins" admin="admins"` |

工作流程:

1. 客户端连 broker(61616),JAAS 拿 `users.properties` 校验用户名密码
2. 认证通过后,系统查 `groups.properties`,把这个用户所属的**每个组都生成一个 `GroupPrincipal`** 挂到登录主体上
3. 收发消息时,`authorizationPlugin` 检查主体里有没有与 `<authorizationEntry>` 的 `read`/`write`/`admin` 属性**同名的 GroupPrincipal**,有才放行

所以本机默认配置下整条链是:`admin`(用户)→ 属于 `admins`(组)→ `admins` 组对 `>`(所有目的地)有读写管理权限 → 所以 admin 账号全权.

#### 2.1.3 "group" 配置存在的意义

一句话:**把权限的授予对象从"单个用户"抽象成"组",授权规则按组写,人只在组里进出**.

- 来了个新运维要能管理所有队列?只需在 groups.properties 里把他的用户名加到 `admins` 行末尾(逗号分隔),**activemq.xml 一行不用动**
- 想做细分权限?可以定义多个组,如 `producers=app1,app2`,`consumers=worker1`,然后给不同队列配不同组的读写权

#### 2.1.4 JAAS 认证方式说明

**JAAS = Java Authentication and Authorization Service**(Java 认证与授权服务),JDK 自带的标准安全框架(`javax.security.auth` 包).核心思想是**可插拔认证**:应用只调用登录入口(`LoginContext`),实际验证逻辑由可替换的 `LoginModule` 完成,用哪个模块由配置文件声明—换认证方式不用改 broker 代码.

**与内联方式的对比**(两种挂法互斥,挂哪个插件就用哪种):

| | 内联方式 | JAAS 方式 |
|---|---|---|
| activemq.xml 插件 | `<simpleAuthenticationPlugin>` | `<jaasAuthenticationPlugin configuration="activemq"/>` |
| 用户/组数据 | 直接写在 activemq.xml | 独立 properties 文件(`users.properties` / `groups.properties`) |
| 认证逻辑 | ActiveMQ 内置简单实现 | 委托 JAAS 框架,由 LoginModule 完成 |
| 适用场景 | 固定少数账号 | 账号频繁增删 / 需对接 LDAP,AD,证书 |

注意:使用内联 `simpleAuthenticationPlugin` 时,`users.properties` / `groups.properties` **不会参与认证**;JAAS 方式才会读它们.

**JAAS 方式的三个组成部分(缺一不可)**:

1. **JVM 启动参数** — 告诉 JVM 去哪读 JAAS 配置:

    ```
    -Djava.security.auth.login.config=D:\apache-activemq-5.17.6\conf\login.config
    ```

2. **`conf/login.config`** — 声明"条目名 → 用哪个 LoginModule + 读哪些数据文件",本机实际内容:

    ```properties
    activemq {
        org.apache.activemq.jaas.PropertiesLoginModule required
            org.apache.activemq.jaas.properties.user="users.properties"
            org.apache.activemq.jaas.properties.group="groups.properties";
    };
    ```

    - `activemq` = 条目名,插件通过 `configuration="activemq"` 引用
    - `PropertiesLoginModule required` = 该模块必须认证成功(`required` 是控制标志)
    - 后两个参数 = 用户,组数据的来源文件(相对路径,默认在 conf 目录)

3. **activemq.xml 挂插件** — `<jaasAuthenticationPlugin configuration="activemq"/>`

**认证流程**:客户端连接 → `LoginContext("activemq")` → 查 login.config 选用 PropertiesLoginModule → 读 `users.properties` 校验密码 → 读 `groups.properties` 确定所属组 → 生成 `UserPrincipal` + 各组 `GroupPrincipal` → 授权插件按组匹配 `authorizationEntry` 放行.

**可插拔的 LoginModule**:ActiveMQ 还内置 `LDAPLoginModule`(对接 LDAP/AD 域账号),`TextFileCertificateLoginModule`(TLS 客户端证书认证)等—换认证源只需改 login.config 一行.

**本机现状**:JVM 参数与 `login.config` 均已就位,但 broker 未挂 `jaasAuthenticationPlugin`(即上文"未挂认证插件"的现状),所以 JAAS 链路未启用.若日后切换:把内联插件整段换成 `<jaasAuthenticationPlugin configuration="activemq"/>`,账号维护到 `users.properties`,组维护到 `groups.properties` 即可.

### 2.2 jetty.xml — 配置网页控制台的端口和 IP

```xml
<bean id="jettyPort" class="org.apache.activemq.web.WebConsolePort" init-method="start">
    <!-- the default port number for the web console -->
    <property name="host" value="127.0.0.1"/>
    <property name="port" value="8161"/>
</bean>
```

## 3. 网页登录的用户名密码 → `conf\jetty-realm.properties`

这就是 http://localhost:8161/ 弹出登录框时校验的文件,当前的实际内容:

```properties
# username: password [,rolename ...]
admin: admin, admin
user: user, user
```

- 网页账号就是这两行:`admin/admin`(admin 角色),`user/user`(user 角色)
- 当前可用账号:`admin / admin`(角色 `admin`)和 `user / user`(角色 `user`),均为出厂默认
- 格式固定:`用户名: 密码 [, 角色名...]`
- **修改/新增账号**:直接改行或加一行即可,例如 `oliver: MyPass123, admin`

## 4. 网页角色权限 → `conf\jetty.xml`

角色不是在 properties 里定义权限,而是在 **`conf\jetty.xml`** 的安全约束中决定"哪个角色能看哪些页面":

```xml
<property name="roles" value="user,admin"/>   <!-- securityConstraint:普通页面,user/admin 都可 -->
<property name="roles" value="admin"/>        <!-- adminSecurityConstraint:管理功能,仅 admin -->
```

| Bean(jetty.xml 行号) | roles 值 | 作用范围 |
|---|---|---|
| `securityConstraint`(L32-34) | `user,admin` | 普通页面(控制台浏览,队列查看等),两个角色都可访问 |
| `adminSecurityConstraint`(L38-40) | `admin` | 管理功能(发送/删除消息,删队列等),仅 `admin` 角色可访问 |

- 两个约束分别通过 `securityConstraintMapping`(L44)和 `adminSecurityConstraintMapping`(L48)挂到 `securityHandler`(L104)
- `jetty-realm.properties` 里第三个字段的角色名必须与这里的 roles 值**精确匹配**(区分大小写)
- 想加一个"只能看不能操作"的角色:在 jetty-realm.properties 加用户(挂新角色名),并在 jetty.xml 中为该角色配置对应约束

所以 `jetty-realm.properties` 里第三个字段的角色名要和这里的值对得上.想加一个只能看不能管的角色,就在这里扩展.

## 5. 两套认证体系对照(易混淆点)

| 维度 | Web 控制台(8161) | 消息连接(MQTT 1883/9072 等) |
|---|---|---|
| 账号文件 | `conf\jetty-realm.properties` | `conf\users.properties`(当前未生效) |
| 角色文件 | jetty.xml 内的 Constraint(roles=user,admin / admin) | `conf\groups.properties`(当前未生效) |
| 角色名 | `admin`,`user` | `admins`(组) |
| 现状 | 已启用,admin/admin 可登录 | 未启用,匿名可连 |

> 注意:`jetty-realm.properties` 的 `admin` 角色(管网页)与 `groups.properties` 的 `admins` 组(管消息队列权限)名字相近但**互不相干**.

## 6. 修改后的生效方式

配置文件修改后需重启服务:

- 服务方式:管理员身份执行 `D:\apache-activemq-5.17.6\bin\win64\wrapper.exe` 对应的服务控制(若注册为 Windows 服务,用 `services.msc` 重启对应服务)
- 脚本方式:`D:\apache-activemq-5.17.6\bin\activemq.bat restart`
- Web 控制台的 jetty 配置改动同样需要重启才生效

## 7. Nodejs中的MQTT连接参数

```
clientId: 该参数是标识MQTT的客户端,不能存在2个相同的clientId,否则会被踢掉.
    也就是MQTT的客户端连接是通过clientId来区分的,如果有2个相同的clientId,那么后连接的会把前一个踢掉.
    这个问题主要在服务器多集群模式下,每个进程的clientId都不能一样.有可能丢消息就是这个导致的,因为挤掉了前一个连接
    
clean: true表示客户端断开连接后,服务端会清除该客户端的所有订阅信息,如果是false,则不会清除订阅信息.

clean这个参数,所谓的activemq不清除订阅消息是指Number Of Consumers还是=1,也就是消费者的数量没有删除,但是实际上是离线的
如果clean=false,就算断开了连接,Number Of Consumers还是没有减少的,这个是一个大坑,需要记得,只有true的时候,断开连接消费者数量才会减少

qos: 0: 发送消息时,服务端不会确认消息是否到达,也不会重发,如果消息丢失了,则不会重发.
     1: 发送消息时,服务端会确认消息是否到达,如果没有到达,则会重发.
     2: 发送消息时,服务端会确认消息是否到达,如果没有到达,则会重发.但是会保证消息只会到达一次.
     
测试发现不建议用qos=2,发现会重复接收到相同的消息,并且不会覆盖或者删除那一条消息
目前使用qos=0是最稳妥的,如果使用qos=1,会发现要使用clean=false,才能接收到离线消息,并且需要是先设置了clean=true,clientId=xxx离线后,
重连使用clean=false,clientId=xxx,才能接收到离线消息,如果clean=true,则不会接收到离线消息
并且要注意一点的是qos只对订阅者有效,对发布者无效,也就是发布者发送消息时,不管qos设置为多少,服务端都会收到消息,只有订阅者根据qos规则来接收消息
```

```
MQTT的发布者不需要订阅,只有接收消息的消费者需要订阅,也就是发布者按某个主题发出去即可,关键的是接收消息的一方的设置
```

## 8. 最后总结

```
1. activemq的配置: 
   1.1 网页登录的账号密码在jetty-realm.properties中配置,网页的角色权限在jetty.xml中配置,不同角色登录网页可执行的操作也不一样
   1.2 消息验证分2种,一种是简单的授权,另一种是JAAS授权
   1.3 clientId只能维持一个连接,如果有2个相同的clientId,那么后连接的会把前一个踢掉,容易导致丢消息
   1.4 qos只针对订阅者有效,一般设置0或者1,很少有2
   1.5 clean=false时,必须设置clientId.当断开连接后,Number Of Consumers不会减少,需要注意.只有false时,qos=1才会拉取离线消息
   1.6 发消息者不需要订阅,只有接收消息才需要订阅,发送方只需要连接上消息服务器,直接按主题发消息即可,接收方才需要订阅主题,才能接收到消息
   1.7 如果使用jolokia api来删除topic,需要在jolokia-access.xml的commands节点下新增<command>exec</command>
```