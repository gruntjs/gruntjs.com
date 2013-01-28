# The grunt API
<% _.each(sections, function(section) { %>
  * [grunt.<%= section.name %>](<%= section.name %>.html) <%
}); %>
