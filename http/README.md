# HTTP

请求的一方叫客户端，响应的一方叫服务器端<br>
通过请求和响应达成通信<br>
HTTP是一种不保存状态的协议<br>

## HTTP特点

- http是不保存状态的协议，使用cookie来管理状态
- 为了防止每次请求都会造成无谓的tcp链接建立和断开，所以采用保持链接的方式
- 以前发送请求后需要等待并收到响应，才能发下一个，现在都是管线化的方式

## HTTP缺点

通信采用明文

不验证通信方的身份

无法验证内容的完整性 (内容可能被篡改) 

> 通过SSL（安全套阶层）建立安全通信线路 HTTPS (超文本传输安全协议)

## 请求报文

- 请求行
  - 方法
    - GET 获取资源
    - POST 向服务器端发送数据，传输实体主体
    - PUT 传输文件
    - HEAD 获取报文首部
    - DELETE 删除文件
    - OPTIONS 询问支持的方法
    - TRACE 追踪路径
  - 协议/版本号
  - URL
- 请求头
  - 通用首部(General Header)
  - 请求首部(Request Header)
  - 响应首部(Response Header)
  - 实体首部(Entity Header Fields)
- 请求体

## 响应报文

- 响应行
- 响应头
- 响应体

## 状态码

状态码负责表示客户端请求的返回结果、标记服务器端是否正常、通知出现的错误

状态码类别

| 类别          | 原因                         | 
| --------------| --------------------------  | 
| 1XX           | Informational(信息性状态码)  |
| 2XX           | Success(成功状态码)          |
| 3XX           | Redirection(重定向)           |
| 4XX           | Client Error(客户端错误状态码) |
| 5XX           | Server Error(服务器错误状态吗) |

2XX 成功

- 200(OK 客户端发过来的数据被正常处理)
- 204(Not Content 正常响应，没有实体)
- 206(Partial Content 范围请求，返回部分数据，响应报文中由Content-Range指定实体内容)

3XX 重定向

- 301(Moved Permanently) 永久重定向
- 302(Found) 临时重定向，规范要求方法名不变，但是都会改变
- 303(See Other) 和302类似，但必须用GET方法
- 304(Not Modified) 状态未改变 配合(If-Match、If-Modified-Since、If-None_Match、If-Range、If-Unmodified-Since)
- 307(Temporary Redirect) 临时重定向，不该改变请求方法

4XX 客户端错误

- 400(Bad Request) 请求报文语法错误
- 401 (unauthorized) 需要认证
- 403(Forbidden) 服务器拒绝访问对应的资源
- 404(Not Found) 服务器上无法找到资源

5XX 服务器端错误

- 500(Internal Server Error)服务器故障
- 503(Service Unavailable) 服务器处于超负载或正在停机维护

## 首部

通用首部字段

| 首部字段名          | 说明                    | 
| --------------     | ------------------------| 
| Cache-Control      | 控制缓存行为             |
| Connection         | 链接的管理               |
| Date               | 报文日期                 |
| Pragma             | 报文指令                 |
| Trailer            | 报文尾部的首部            |
| Trasfer-Encoding   | 指定报文主体的传输编码方式 |
| Upgrade            | 升级为其他协议            |
| Via                | 代理服务器信息            |
| Warning            | 错误通知                  |

请求首部字段

| 首部字段名           | 说明                                      | 
| --------------      | ------------------------                  | 
| Accept              | 用户代理可处理的媒体类型                    |
| Accept-Charset      | 优先的字符集                               |
| Accept-Encoding     | 优先的编码                                 |
| Accept-Langulage    | 优先的语言                                 |
| Authorization       | Web认证信息                                |
| Expect              | 期待服务器的特定行为                        |
| From                | 用户的电子邮箱地址                          |
| Host                | 请求资源所在的服务器                         |
| If-Match            | 比较实体标记                                |
| If-Modified-Since   | 比较资源的更新时间                           |
| If-None-Match       | 比较实体标记                                |
| If-Range            | 资源未更新时发送实体Byte的范围请求            |
| If-Unmodified-Since | 比较资源的更新时间(和If-Modified-Since相反)  |
| Max-Forwards        | 最大传输数                                  |
| Proxy-Authorization | 代理服务器需要客户端认证                      |
| Range               | 实体字节范围请求                             |
| Referer             | 请求中的URI的原始获取方                      |
| TE                  | 传输编码的优先级                             |
| User-Agent          | HTTP客户端程序的信息                         |

响应首部字段

| 首部字段名          | 说明                        | 
| --------------     | ------------------------   | 
| Accept-Ranges      | 是否接受字节范围             |
| Age                | 资源的创建时间               |
| ETag               | 资源的匹配信息               |
| Location           | 客户端重定向至指定的URI      |
| Proxy-Authenticate | 代理服务器对客户端的认证信息  |
| Retry-After        | 再次发送请求的时机           |
| Server             | 服务器的信息                |
| Vary               | 代理服务器缓存的管理信息     |
| www-Authenticate   | 服务器对客户端的认证         |

实体首部字段
| 首部字段名          | 说明                    | 
| --------------     | ------------------------| 
| Allow              | 资源可支持的HTTP方法      |
| Content-Encoding   | 实体的编码方式            |
| Content-Language   | 实体的自然语言            |
| Content-Length     | 实体的内容大小(字节为单位) |
| Content-Location   | 替代对应资源的URI         |
| Content-MD5        | 实体的报文摘要            |
| Content-Range      | 实体的位置范围            |
| Content-Type       | 实体主体的媒体类型        |
| Expires            | 实体过期时间              |
| Last-Modified      | 资源的最后修改时间         |
