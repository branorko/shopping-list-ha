"""Config flow for Shopping List integration."""
from homeassistant import config_entries


class ShoppingListConfigFlow(config_entries.ConfigFlow, domain="shopping_list"):
    """Handle a config flow for Shopping List."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        if user_input is not None:
            return self.async_create_entry(title="Shopping List", data={})

        return self.async_show_form(step_id="user")
