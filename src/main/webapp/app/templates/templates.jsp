<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- Layouts -->
<script id="container-layout" type="layout">
  <c:import url="/app/templates/container.jsp"></c:import>
</script>

<script id="tags-layout" type="layout">
  <c:import url="/app/templates/tags.jsp"></c:import>
</script>

<!-- Templates -->
<script id="url-template" type="text/x-handlebars-template">
  <c:import url="/app/templates/url.jsp"></c:import>
</script>

<script id="tag-item-template" type="text/x-handlebars-template">
  <c:import url="/app/templates/tag-item.jsp"></c:import>
</script>

<script id="pagesource-template" type="text/x-handlebars-template">
  <c:import url="/app/templates/pagesource.jsp"></c:import>
</script>

