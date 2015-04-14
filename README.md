## Usage
- Checkout repository. Change to dir with <code>pom.xml</code>
- Clean compile: <code>mvn clean compile</code>
- Unit Test: <code>mvn test</code> 
- Build war: <code>mvn package</code>, or <code>mvn package -DskipTests</code>
- Run using Jetty: <code>mvn jetty:run</code>

## Framework

The stack is java, backbone and marionette based. A struts2 maven archetype was
used as the starting point. Supportive code that includes helpful APIs,
utilities, setup for backbone/marionette etc is from my most recent project,
twendai. Not all of the framework from twendai is included, which means support
for writing jasmine/selenium tests, integration testing with browsers etc is
missing.

## Analysis

The exercise contains three basic steps. 
- Get HTML source given url
- Determine tag frequence therein
- Highlight tags upon tag selection

A http client library is used for the first. There is more than one way to do
tag counting and tag highlighting. Some analysis follows.

Display of HTML source can use <code>&lt;pre&gt;</code>,
<code>&lt;code&gt;</code> or a HTML table with escaped HTML source as table
content. Highlighting requires wrapping the selected tag text with a span in all
cases, and optionally breaking up the <code>&lt;pre&gt;</code> and
<code>&lt;code&gt;</code> segments. Lets call this the display HTML. An example
is chrome "inspect element" of a "view page source".

An HTML parser can be relied upon to provide an accurate tag count. For example,
tag counts can be built by traversing a DOM for the downloaded HTML source.
However, this DOM cannot help with generating the display HTML. So parsing the
downloaded HTML source and/or search and replace of the display HTML is
required. 

Highlight span wrapping can be done either on-demand when the user selects a tag,
or all tags can be pre-wrapped. The later is better for client performance and
hence UX.  Multiple string search and replace calls, string mutations therein
can be avoided. Using jquery to find the appropriate pre-wrapped spans is
assumed to be faster on average, and this is particularly true when the HTML
source is large. Hence, the **server generates the final display HTML** and the
**client only turns highlighting on/off. **

Regex based, or custom parsing of HTML as opposed to using a true HTML parser
is wrong in general, but may work for some use cases. Ironically, this also 
implies that if both HTML parser and regex are used, the UX will be bad for 
the case where only the HTML parser is correct.  For example, reporting 4
<code>&lt;div&gt;</code> tags but highlighting 5 is bad.

We use this as the deciding factor to **not use a HTML parser**, and suffer the
inaccurate tag detection and ensuing tag counts as they arise, but remain
consistent. It is conceivable that the regex is extended as failing cases are
identified, and state is added to address scenarios like discounting tags inside
comments. This tends to eventually implementing a parser, but one that also
generates the display HTML while building the DOM. This is essentially the ideal
solution, but is assumed
to be beyond the scope of this exercise.

## Functionality, Implementation Overview
- Prefix <code>http://</code> if required
- Download html source using HTTPClient library
- Regex parse tags, wrap and build counts
- Display HTML source as innerHTML of a display div
- Use wrap spans to un/highlight selected tags
- Ensure javascript is enabled
- Map server errors to HTTP response codes
- App code starting points
  - <code>PageSource.java, PageSourceData.java, PageSourceTest.java</code>
  - <code>router.js, vs.js:getPageTagsLayout, ds.js:getPageSource, 
ds.js:getPageSourceTags, tags.js, templates/</code>

## Not Supported, Limitations, TODO
- Tags inside scripts, comments etc should be discounted
- <code>&lt;!DOCTYPE&gt; &lt;!-- --&gt;</code> could be detected
- Detected tags are a superset of valid HTML tags
- Unit/Integration test for frontend
- Integration testing for backend
- Production packaging (minification etc)
- Site discovery. It is assumed user knows what this app is for.
- Support for time out on get request to target server
- Wait indication, such as a spinner, is not provided.
- HTTP client response body streaming, as opposed to
<code>String responsebody;</code>
- Removing references to twendai
- Likely a lot more, but gating on time

## Testing
- <code>grunt jshint</code>. Grunt <code>node_modules</code> not included given
size. So a checkout won't allow running grunt as is.
- <code>PageSourceTest.java</code>
- Manual Testing
  - Valid URL: http://www.slack.com, http://twendai.slack.com
  - Invalid URL: http://www.acme.o
  - Prefixing: www.nasa.gov
  - Select tag, verify count manually
  - Verify count with Ctrl-f, for example when endTags <code> 
findCount = 2 * tagCount + 1;</code>
  - Cycle through selecting tags
  - Test for misc URLs



