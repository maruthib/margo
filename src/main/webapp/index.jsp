<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
  <noscript>    <meta http-equiv="refresh" content="0; url=/jsrequired" />
  </noscript>

  <title>Tags</title>

  <!-- Application styles. -->
  <link rel="stylesheet" type="text/css" media="screen, projection" 
    href="/css/reset.css" />
  <link rel="stylesheet" type="text/css" media="screen, projection" 
    href="/css/bootstrap.css" />
  <link rel="stylesheet" type="text/css" media="screen, projection" 
    href="/css/content.css" />
  
  <!-- Scripts -->
  <script type="text/javascript" src="/js/jquery.min.js"></script>    

</head>

<body>
  <div id="doc">
    <div id="container" class="container">
      <div id="plg-one-col"></div>
    </div>
  </div>
  
  <!-- Templates -->
  <c:import url="/app/templates/templates.jsp"></c:import>
      
  <script data-main="/app/config" src="/js/require.js"></script>          
      
</body>
</html>