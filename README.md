## service-base-ui
Basic React library for harmonizing Business Network Portal UI services.

This library provides elementary service structures like navigation, routing, modal dialogs, notification handling and context preparation.

Components in this library are divided into multiple different namespaces exposing public code. You can find the following namespaces providing you with containers, components and APIs.

* [Containers]()
* [Components]()
* [System]()

## Containers
The **Containers** namespace usually contains **components** that are more or less **standalone** entry points that might have not properties passed from outside the component, define basic structures and/or **combine multiple components** together in order to control them.

The following container are currently available:

* ServiceLayout

#### &lt;ServiceLayout&gt;
The **ServiceLayout** container provides the basic frame structure for a UI service based on this library. In most applications, this should be the **entry point** for every React application. It **provides** all basic **context data** and UI APIs to control the user interface from the inside of nested components.

In addition, **ServiceLayout** imports all basic **CSS** styles including **bootstrap** and its JavaScript. Because of several limitations, it does not include jQuery.

##### Usage example
```JS
import React from 'react';
import { Containers } from '@opuscapita/service-base-ui';
import { Route } from 'react-router';

class Main extends React.Component
{
    render()
    {
        <Containers.ServiceLayout serviceName="my-service-name">
            <Route path="/" component={MyFirstComponent}></Route>
            <Route path="/second" component={MySecondComponent}></Route>
        </Containers.ServiceLayout>
    }
}

export default Main;
```

In order to use the full potential of the **ServiceLayout** container, components implemented to build a service's user interface should extend the Components **ContextComponent** or **ConditionalRenderComponent** instead of React.Component.

##### Context (UI API)
**ServiceLayout** provides an API to all child components easily accessible through **React's context** object. It provides **UI access** like modal dialogs, notifications, menu visibility and **current user information**.

All API is accessed using the **this.context** object. It all APIs are automatically available one a component extends the components **ContextComponent** or **ConditionalRenderComponent**.

###### Props
|Name|Type|Required|Possible values|Default value|Description|
|:---|:---|--------|---------------|-------------|:----------|
|serviceName|string|true|||Name of the current service which is also used in the URL in order to identify routes in the current application.|
|component|function|false|||And additional component to be wrapped around all inner components.|
|size|string|false|null, '', 'default', 'full-width', 'full-screen'|'default'|Defines the layout size of the outer frame. See setLayoutSize() below.|


###### Objects
The following objects are available through a component's context:

* [router](https://github.com/ReactTraining/react-router)
* [userData](https://github.com/OpusCapita/useridentity-middleware)
* [userProfile](https://github.com/OpusCapita/user/wiki/user.model#userprofile)
* [i18n](https://github.com/OpusCapita/i18n)
* locale (en, de, ...)

###### Methods
The following methods are available through a component's context:

* [showNotification]()
* [hideNotification]()
* [clearNotifications]()
* [showModalDialog]()
* [hideModalDialog]()
* [refreshUserData]()
* [refreshUserProfile]()
* [setLocale]()
* [showSpinner]()
* [hideSpinner]()
* [setPageTitle]()
* [logOutUser]()
* [setLayoutSize]()
* [getLayoutSize]()
* [showLogInDialog]()
* [hideLogInDialog]()

###### showNotification
Shows a short notification bubble on the top of a page that will automatically disappear after a certain amount of time. **Returns** a **notification handle object** which can be used to actively hide a certain notification.

Notifications are stacked on every call to this method.

```JS
showNotification(message, level = 'info', duration = 4) : object
```

|Name|Type|Required|Possible values|Description|
|:---|----|--------|:--------------|:----------|
|message|string|true||Message to be displayed|
|level|string|true|'success', 'error', 'warning', 'info'|Controls style and color of a message bubble.|
|duration|integer|true||Duration in seconds a message lasts visible.|

###### hideNotification
Remove a certain notification.

```JS
hideNotification(handle, duration = 1) : void
```
|Name|Type|Required|Description|
|:---|----|--------|:----------|
|handle|object|true|Notification handle create by a call to showNotification().|
|duration|integer|true|Time in seconds until a message disappears.|

###### clearNotifications
**Removes all notifications** displayed instantly.

```JS
clearNotifications()
```

###### showModalDialog
Displays a **modal dialog** using the ModalDialog component that covers the whole page. This method is meant to **display simple messages** or ask for user interactions like **confirmation dialogs**. There can be only one modal dialog at a time.

Dialogs can be actively hidden using the **hideModalDialog()** method.

```JS
showModalDialog(title, message, onButtonClick, buttons)
```
|Name|Type|Required|Description|
|:---|----|--------|:----------|
|title|string|true|A dialog's window title.|
|message|string|true|A text message displayed.|
|onButtonClick|function|false|**Callback function** to be called once a dialog **button** gets **clicked**. The dialog **automatically closes** if the function's **return** value is anything but **false** or **Promise.resolve(false)**.|
|buttons|object|false|Object defining **dialog buttons**. The keys inside that object identify a button as it is passed to the onButtonClick callback. Its value is used as a button's label. The **first** object entry is used as the **primary button**.

###### hideModalDialog
Hides a modal dialog currently displayed.

```JS
hideModalDialog()
```

###### refreshUserData / refreshUserProfile
Runs a full **refresh** of all **user related data** in the user interface which also results in a full re-rendering of the application. This method should only be called if essential parts of a user's information have changed like profile settings e.g. language switch.

The methods **refreshUserData()** and **refreshUserProfile()** actually refer to the **same** method so only one of them should be called. This is made for API design reasons as userData and userProfile are two separate entities in this API.

```JS
refreshUserData()
```
```JS
refreshUserProfile()
```

###### setLocale
Sets the **language** of the **current user's** user interface and **stores** the new language settings inside the current **user's profile**.

Calling this method triggers a full re-rendering of the application as it calls refreshUserData().

```JS
setLocale(locale)
```
|Name|Type|Required|Description|
|:---|----|--------|:----------|
|locale|string|true|Locale in the form of a simple language value like en or de.|

###### showSpinner / hideSpinner
Shows a **full page spinner**. This **blocks** all user **interactions** with the underlying user interface. As this feature is very invasive, it should only be used very carefully.

System **spinners** get **stacked** internally on every call to showSpinner(). This means the spinner only gets hidden after the final call to hideSpinner() removes the last spinner shown.

```JS
showSpinner()
```
```JS
hideSpinner()
```

###### setPageTitle
Sets the **document** (browser) **title** of an application.

```JS
setPageTitle(title)
```
|Name|Type|Required|Description|
|:---|----|--------|:----------|
|title|string|false|Document title of an application.|

###### logOutUser
**Ends a user's session** by redirecting them to the log-out endpoint which will then display the log-in page. If an optional backToUrl is passed, a user gets redirected to this URL once they log-in again.
```JS
logOutUser(backToUrl)
```

|Name|Type|Required|Description|
|:---|----|--------|:----------|
|backToUrl|string|false|Full URL to be redirected after a successful re-log-in.|

###### setLayoutSize
Besides the **size** property of the **ServiceLayout** component, this method allows switching the main layout in a limited way from within a component. It can be used to **hide the menu** or even **widening the content** area.

```JS
setLayoutSize(size)
```
|Name|Type|Required|Possible values|Description|
|:---|----|--------|:--------------|:----------|
|size|string|true|null, '', 'default', 'full-width', 'full-screen'|Size identifier.|

###### getLayoutSize
Returns the size identifier of the currently used layout size.

```JS
getLayoutSize()
```

###### showLogInDialog (not fully implemented yet)
Brings up a **modal log-in dialog** for users to re-log-in and continue using the application **without** getting redirected to the normal log-in page and **losing their state**. **Returns** a **promise** resolving with **true** or **false** depending on whenever the log-in has been successful;

```JS
showLogInDialog()
```

###### hideLogInDialog
Hides a currently displayed modal log-in dialog.

```JS
hideLogInDialog()
```

## Components
The **Components** namespace contains components that usually have to be supplied with parameters and data from outside. Some of them even bind to REST endpoints in order to provide a quick integration experience.

The following components are currently available:

* DatePicker
* LogInForm
* MainMenu
* ContextComponent
* ConditionalRenderComponent
* ListTable
* ModalDialog

## System
The **System** namespace contains API methods which can but don't have to be bound to UI related topics.

The following APIs are currently available:

* ResetTimer
* UI.nl2br
