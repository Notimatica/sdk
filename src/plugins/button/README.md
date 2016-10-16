# Button plugin

Simple way to provide user action button to subscribe to notifications. With nice popover to interact with user.

## Installation
```html
<script src="https://cdn.notimatica.io/sdks/latest/notimatica-sdk.js" async></script>
<script>
  var Notimatica = Notimatica || [];
  Notimatica.push(['init', {
    project: 'PROJECT_ID',
    plugins: {
      button: {
        enabled: true,
        position: 'bottom-left'
      }
    }
  }]);
</script>
```

## Options

| Name | Type | Default value | Description |
|------|------|---------------|-------------|
| autorun | Boolean | `true` | Run plugin right after it loaded. Adds ability to run it manually |
| target | String | `'body'` | Selector of the element that will be appended with plugin's html |
| css | String | `Notimatica.options.sdkPath + '/notimatica-button.css'` | Where to get css |
| cssTarget | String | `'head'` | Selector of the element that will be appended with plugin's css styles |
| position | String | `'bottom-right'` | Position of the button on the screen. Can be: bottom-right, bottom-left, top-right or top-left |
| usePopover | Boolean | true | Show popover with subscription message on button click, or start subscribing |

Also you can provide onclick callback that will be triggered on Subscribe/Unsubscribe button on popover or on button itself. It can be done via `click` option. Default is pretty simple:

```javascript
function {
  Notimatica.isSubscribed()
    ? Notimatica.unsubscribe()
    : Notimatica.subscribe()
}
```

## Strings

| String | Default |
|--------|---------|
| `popover.subscribe` | Do you want to recieve desktop notifications from our site? Click Subscribe button! |
| `popover.unsubscribe` | If you don't want to recieve notifications anymore, click Unsubscribe button. |
| `popover.button.subscribe` | Subscribe |
| `popover.button.unsubscribe` | Unsubscribe |
| `tooltip.subscribe` | Subscribe to notifications |
| `tooltip.unsubscribe` | Unsubscribe from notifications |
| `tooltip.message` | There is a message for you |
