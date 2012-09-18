# Contrib Plugins
<% _.each(sections, function(section) { %>
  * [grunt-contrib-<%= section.name %>](<%= section.name %>.md) - <%= section.description %><%
}); %>
