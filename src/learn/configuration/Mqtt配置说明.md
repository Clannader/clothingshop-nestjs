# Mqtt 配置说明

## 1. Mqtt 官网指标说明

Mqtt 官网上显示的 Number Of Consumers / Messages Enqueued / Messages Dequeued：

| 指标 | 含义 |
|---|---|
| Number Of Consumers | 消费者数量，表示当前有多少个消费者正在订阅该主题 |
| Messages Enqueued | 入队消息数量，表示当前有多少条消息已经被发布到该主题 |
| Messages Dequeued | 出队消息数量，表示当前有多少条消息已经被消费者接收并处理 |

示例：假设有 2 个消费者，发布了 2 条消息，那么 Number Of Consumers 为 2，Messages Enqueued 为 2，Messages Dequeued 为 4。

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

⚠️ **关键发现：`activemq.xml` 的 `<broker>` 中没有配置任何 `<plugins>` 认证插件**，因此：

- 目前 MQTT 客户端连 1883 / 9072（以及 OpenWire/AMQP/STOMP）**不需要用户名密码，可匿名连接**，且这些端口绑定在 `0.0.0.0`（对所有网卡开放）
- 以下文件目前只是**预留、并未生效**：
    - `conf\users.properties`：`admin=admin`（JAAS 用户，MQTT/消息连接用）
    - `conf\groups.properties`：`admins=admin`（组 → 用户映射，配合授权插件按队列读写控制）
    - `conf\login.config`：JAAS 登录入口（java 进程已通过 `-Djava.security.auth.login.config` 加载，但 broker 未挂插件所以不起作用）

**若要启用 MQTT 连接认证**，在 `activemq.xml` 的 `<broker>` 元素内加：

```xml
<plugins>
    <simpleAuthenticationPlugin>
        <users>
            <authenticationUser username="admin" password="admin" groups="admins"/>
        </users>
    </simpleAuthenticationPlugin>
    <!-- 可选：按组授权队列读写 -->
    <authorizationPlugin>
        <map>
            <authorizationMap>
                <authorizationEntries>
                    <authorizationEntry queue=">" write="admins" read="admins" admin="admins"/>
                    <authorizationEntry topic=">" write="admins" read="admins" admin="admins"/>
                </authorizationEntries>
            </authorizationMap>
        </map>
    </authorizationPlugin>
</plugins>
```

### 2.2 jetty.xml — 配置网页控制台的端口和 IP

```xml
<bean id="jettyPort" class="org.apache.activemq.web.WebConsolePort" init-method="start">
    <!-- the default port number for the web console -->
    <property name="host" value="127.0.0.1"/>
    <property name="port" value="8161"/>
</bean>
```

## 3. 网页登录的用户名密码 → `conf\jetty-realm.properties`

这就是 http://localhost:8161/ 弹出登录框时校验的文件，当前的实际内容：

```properties
# username: password [,rolename ...]
admin: admin, admin
user: user, user
```

- 网页账号就是这两行：`admin/admin`（admin 角色）、`user/user`（user 角色）
- 当前可用账号：`admin / admin`（角色 `admin`）和 `user / user`（角色 `user`），均为出厂默认
- 格式固定：`用户名: 密码 [, 角色名...]`
- **修改/新增账号**：直接改行或加一行即可，例如 `oliver: MyPass123, admin`

## 4. 网页角色权限 → `conf\jetty.xml`

角色不是在 properties 里定义权限，而是在 **`conf\jetty.xml`** 的安全约束中决定"哪个角色能看哪些页面"：

```xml
<property name="roles" value="user,admin"/>   <!-- securityConstraint：普通页面，user/admin 都可 -->
<property name="roles" value="admin"/>        <!-- adminSecurityConstraint：管理功能，仅 admin -->
```

| Bean（jetty.xml 行号） | roles 值 | 作用范围 |
|---|---|---|
| `securityConstraint`（L32-34） | `user,admin` | 普通页面（控制台浏览、队列查看等），两个角色都可访问 |
| `adminSecurityConstraint`（L38-40） | `admin` | 管理功能（发送/删除消息、删队列等），仅 `admin` 角色可访问 |

- 两个约束分别通过 `securityConstraintMapping`（L44）和 `adminSecurityConstraintMapping`（L48）挂到 `securityHandler`（L104）
- `jetty-realm.properties` 里第三个字段的角色名必须与这里的 roles 值**精确匹配**（区分大小写）
- 想加一个"只能看不能操作"的角色：在 jetty-realm.properties 加用户（挂新角色名），并在 jetty.xml 中为该角色配置对应约束

所以 `jetty-realm.properties` 里第三个字段的角色名要和这里的值对得上。想加一个只能看不能管的角色，就在这里扩展。

## 5. 两套认证体系对照（易混淆点）

| 维度 | Web 控制台（8161） | 消息连接（MQTT 1883/9072 等） |
|---|---|---|
| 账号文件 | `conf\jetty-realm.properties` | `conf\users.properties`（当前未生效） |
| 角色文件 | jetty.xml 内的 Constraint（roles=user,admin / admin） | `conf\groups.properties`（当前未生效） |
| 角色名 | `admin`、`user` | `admins`（组） |
| 现状 | 已启用，admin/admin 可登录 | 未启用，匿名可连 |

> 注意：`jetty-realm.properties` 的 `admin` 角色（管网页）与 `groups.properties` 的 `admins` 组（管消息队列权限）名字相近但**互不相干**。

## 6. 修改后的生效方式

配置文件修改后需重启服务：

- 服务方式：管理员身份执行 `D:\apache-activemq-5.17.6\bin\win64\wrapper.exe` 对应的服务控制（若注册为 Windows 服务，用 `services.msc` 重启对应服务）
- 脚本方式：`D:\apache-activemq-5.17.6\bin\activemq.bat restart`
- Web 控制台的 jetty 配置改动同样需要重启才生效
