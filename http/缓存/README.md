# HTTP 缓存

减少了冗余的数据传输，节省了网费。<br>
减少了服务器的负担， 大大提高了网站的性能<br>
加快了客户端加载网页的速度<br>

## 缓存分类

HTTP 缓存是我们日常开发中最为熟悉的一种缓存机制。它又分为**强缓存**和**协商缓存**。优先级较高的是强缓存，在命中强缓存失败的情况下，才会走协商缓存。

### 强缓存的特征

强缓存是利用 http 头中的 Expires 和 Cache-Control 两个字段来控制的。强缓存中，当请求再次发出时，浏览器会根据其中的 expires 和 cache-control 判断目标资源是否“命中”强缓存，若命中则直接从缓存中获取资源，**不会再与服务端发生通信。**

命中强缓存的情况下，返回的 HTTP 状态码为 200 （如下图）。

![](https://user-gold-cdn.xitu.io/2018/9/20/165f6a683fc021e1?w=660&h=100&f=png&s=15006)

### 强缓存的实现：从 expires 到 cache-control

实现强缓存，过去我们一直用 `expires`。  
当服务器返回响应时，在 Response Headers 中将过期时间写入 expires 字段。像这样：

![](https://user-gold-cdn.xitu.io/2018/9/20/165f52bf6e844b85?w=710&h=388&f=png&s=67960)

我们给 expires 一个特写：

```
expires: Wed, 11 Sep 2019 16:12:18 GMT

```

可以看到，expires 是一个时间戳，接下来如果我们试图再次向服务器请求资源，浏览器就会先对比本地时间和 expires 的时间戳，如果本地时间小于 expires 设定的过期时间，那么就直接去缓存中取这个资源。

从这样的描述中大家也不难猜测，expires 是有问题的，它最大的问题在于对“本地时间”的依赖。如果服务端和客户端的时间设置可能不同，或者我直接手动去把客户端的时间改掉，那么 expires 将无法达到我们的预期。

考虑到 expires 的局限性，HTTP1.1 新增了 `Cache-Control` 字段来完成 expires 的任务。  
expires 能做的事情，Cache-Control 都能做；expires 完成不了的事情，Cache-Control 也能做。因此，Cache-Control 可以视作是 expires 的**完全替代方案**。在当下的前端实践里，我们继续使用 expires 的唯一目的就是**向下兼容**。

现在我们给 Cache-Control 字段一个特写：

```
cache-control: max-age=31536000

```

如大家所见，在 Cache-Control 中，我们通过 `max-age` 来控制资源的有效期。max-age 不是一个时间戳，而是一个时间长度。在本例中，max-age 是 31536000 秒，它意味着该资源在 31536000 秒以内都是有效的，完美地规避了时间戳带来的潜在问题。

**Cache-Control 相对于 expires 更加准确，它的优先级也更高。当 Cache-Control 与 expires 同时出现时，我们以 Cache-Control 为准。**

### Cache-Control 应用分析

Cache-Control 的神通，可不止于这一个小小的 max-age。如下的用法也非常常见：

```
cache-control: max-age=3600, s-maxage=31536000

```

**s-maxage 优先级高于 max-age，两者同时出现时，优先考虑 s-maxage。如果 s-maxage 未过期，则向代理服务器请求其缓存内容。**

这个 s-maxage 不像 max-age 一样为大家所熟知。的确，在项目不是特别大的场景下，max-age 足够用了。但在依赖各种**代理**的大型架构中，我们不得不考虑**代理服务器**的缓存问题。s-maxage仅在代理服务器中生效（比如 cache CDN）的缓存的有效时间的，并只对 public 缓存有效。，客户端中我们只考虑max-age。

那么什么是 public 缓存呢？说到这里，Cache-Control 中有一些适合放在一起理解的知识点，我们集中梳理一下：

#### public 与 private

public 与 private 是针对资源是否能够被代理服务缓存而存在的一组对立概念。

如果我们为资源设置了 public，那么它既可以被浏览器缓存，也可以被代理服务器缓存；如果我们设置了 private，则该资源只能被浏览器缓存。private 为**默认值**。但多数情况下，public 并不需要我们手动设置，比如有很多线上网站的 cache-control 是这样的：

![](https://user-gold-cdn.xitu.io/2018/9/20/165f6029fc74bbc6?w=756&h=256&f=png&s=40662)

设置了 s-maxage，没设置 public，那么 CDN 还可以缓存这个资源吗？答案是肯定的。因为明确的缓存信息（例如“max-age”）已表示响应是可以缓存的。

#### no-store与no-cache

no-cache 绕开了浏览器：我们为资源设置了 no-cache 后，每一次发起请求都不会再去询问浏览器的缓存情况，而是直接向服务端去确认该资源是否过期（即走我们下文即将讲解的协商缓存的路线）。

no-store 比较绝情，顾名思义就是不使用任何缓存策略。在 no-cache 的基础上，它连服务端的缓存确认也绕开了，只允许你直接向服务端发送请求、并下载完整的响应。

### 协商缓存：浏览器与服务器合作之下的缓存策略

协商缓存依赖于服务端与浏览器之间的通信。

协商缓存机制下，浏览器需要向服务器去询问缓存的相关信息，进而判断是重新发起请求、下载完整的响应，还是从本地获取缓存的资源。

如果服务端提示缓存资源未改动（Not Modified），资源会被**重定向**到浏览器缓存，**这种情况下网络请求对应的状态码是 304**（如下图）。

![](https://user-gold-cdn.xitu.io/2018/9/20/165f6a6d6ffd4cc2?w=710&h=100&f=png&s=15810)

### 协商缓存的实现：从 Last-Modified 到 Etag

Last-Modified 是一个时间戳，如果我们启用了协商缓存，它会在首次请求时随着 Response Headers 返回：

```
Last-Modified: Fri, 27 Oct 2017 06:35:57 GMT

```

随后我们每次请求时，会带上一个叫 If-Modified-Since 的时间戳字段，它的值正是上一次 response 返回给它的 last-modified 值：

```
If-Modified-Since: Fri, 27 Oct 2017 06:35:57 GMT

```

服务器接收到这个时间戳后，会比对该时间戳和资源在服务器上的最后修改时间是否一致，从而判断资源是否发生了变化。如果发生了变化，就会返回一个完整的响应内容，并在 Response Headers 中添加新的 Last-Modified 值；否则，返回如上图的 304 响应，Response Headers 不会再添加 Last-Modified 字段。

使用 Last-Modified 存在一些弊端，这其中最常见的就是这样两个场景：

*   我们编辑了文件，但文件的内容没有改变。服务端并不清楚我们是否真正改变了文件，它仍然通过最后编辑时间进行判断。因此这个资源在再次被请求时，会被当做新资源，进而引发一次完整的响应——不该重新请求的时候，也会重新请求。
    
*   当我们修改文件的速度过快时（比如花了 100ms 完成了改动），由于 If-Modified-Since 只能检查到以秒为最小计量单位的时间差，所以它是感知不到这个改动的——该重新请求的时候，反而没有重新请求了。
    

这两个场景其实指向了同一个 bug——服务器并没有正确感知文件的变化。为了解决这样的问题，Etag 作为 Last-Modified 的补充出现了。

Etag 是由服务器为每个资源生成的唯一的**标识字符串**，这个标识字符串是基于文件内容编码的，只要文件内容不同，它们对应的 Etag 就是不同的，反之亦然。因此 Etag 能够精准地感知文件的变化。

Etag 和 Last-Modified 类似，当首次请求时，我们会在响应头里获取到一个最初的标识符字符串，举个🌰，它可以是这样的：

```
ETag: W/"2a3b-1602480f459"

```

那么下一次请求时，请求头里就会带上一个值相同的、名为 if-None-Match 的字符串供服务端比对了：

```
If-None-Match: W/"2a3b-1602480f459"

```

Etag 的生成过程需要服务器额外付出开销，会影响服务端的性能，这是它的弊端。因此启用 Etag 需要我们审时度势。正如我们刚刚所提到的——Etag 并不能替代 Last-Modified，它只能作为 Last-Modified 的补充和强化存在。 **Etag 在感知文件变化上比 Last-Modified 更加准确，优先级也更高。当 Etag 和 Last-Modified 同时存在时，以 Etag 为准。**

## HTTP 缓存决策指南

行文至此，当代 HTTP 缓存技术用到的知识点，我们已经从头到尾挖掘了一遍了。那么在面对一个具体的缓存需求时，我们到底该怎么决策呢？

走到决策建议这一步，我本来想给大家重新画一个流程图。但是画来画去终究不如 Chrome 官方给出的这张清晰、权威：

![](https://user-gold-cdn.xitu.io/2018/9/20/165f701820fafcf8?w=595&h=600&f=png&s=52763)

我们现在一起解读一下这张流程图：

当我们的资源内容不可复用时，直接为 Cache-Control 设置 no-store，拒绝一切形式的缓存；否则考虑是否每次都需要向服务器进行缓存有效确认，如果需要，那么设 Cache-Control 的值为 no-cache；否则考虑该资源是否可以被代理服务器缓存，根据其结果决定是设置为 private 还是 public；然后考虑该资源的过期时间，设置对应的 max-age 和 s-maxage 值；最后，配置协商缓存需要用到的 Etag、Last-Modified 等参数。

## 参考

- [浏览器缓存机制介绍与缓存策略剖析](https://juejin.im/book/5b936540f265da0a9624b04b/section/5b9ba651f265da0ac726e5de)
