&lt;Alert /&gt;
============================

Purpose
-----------------------
Draws global messages.

Examples
-----------------------
<pre><code>
&lt;Alert bsStyle="info"
       message={ this.state.globalInfoMessage }
       visible={ !_.isEmpty(this.state.globalInfoMessage) }
       hideCloseLink={ true }
/&gt;
</code></pre>

Description
-----------------------

Attributes
* *bsStyle* (required) - Defines message style. Available one of 'info' or 'danger'.
* *message* (required) - Defines message string.
* *visible* (optional)- Defines whether component is visible on startup. Default value is *true*.
* *hideCloseLink* (optional)- Defines whether it should be displayed close button. 
