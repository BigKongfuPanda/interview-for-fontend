[关于token和refresh token](https://blog.csdn.net/qq_24127857/article/details/80818742)

access token 是客户端访问资源服务器的令牌。拥有这个令牌代表着得到用户的授权。然而，这个授权应该是临时的，有一定有效期。这是因为，access token 在使用的过程中可能会泄露。给 access token 限定一个较短的有效期可以降低因 access token 泄露而带来的风险。

refresh token 是专用于刷新 access token 的 token。
为什么要刷新 access token 呢？一是因为 access token 是有过期时间的，到了过期时间这个 access token 就失效，需要刷新；二是因为一个 access token 会关联一定的用户权限，如果用户授权更改了，这个 access token 需要被刷新以关联新的权限。

为什么要专门用一个 token 去更新 access token 呢？如果没有 refresh token，也可以刷新 access token，但每次刷新都要用户输入登录用户名与密码，多麻烦。有了 refresh token，可以减少这个麻烦，客户端直接用 refresh token 去更新 access token，无需用户进行额外的操作。