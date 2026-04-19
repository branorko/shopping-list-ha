"""Shopping List — Home Assistant custom integration."""
from __future__ import annotations

import json
import logging
import os
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers.storage import Store
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import HomeAssistantView

_LOGGER = logging.getLogger(__name__)

DOMAIN = "shopping_list"
STORAGE_KEY = "shopping_list.data"
STORAGE_VERSION = 1
STATIC_URL = "/shopping_list_static/shopping-list-card.js"


def _read_version() -> str:
    try:
        manifest_path = os.path.join(os.path.dirname(__file__), "manifest.json")
        with open(manifest_path, encoding="utf-8") as f:
            return json.load(f).get("version", "?")
    except Exception:
        return "?"


VERSION = _read_version()

DEFAULT_DATA = {"items": [], "categories": [], "products": []}


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the integration on HA start."""
    store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
    data = await store.async_load()

    if data is None:
        data = DEFAULT_DATA.copy()
        await store.async_save(data)
        _LOGGER.info("[shopping_list] Created new data store")
    else:
        _LOGGER.info(
            "[shopping_list] Loaded data (%d items, %d categories, %d products)",
            len(data.get("items", [])),
            len(data.get("categories", [])),
            len(data.get("products", [])),
        )

    hass.data[DOMAIN] = {"store": store, "data": data, "version": VERSION}

    # Register REST API
    hass.http.register_view(ShoppingListDataView(hass))
    hass.http.register_view(ShoppingListVersionView())

    # Register static JS file
    js_path = os.path.join(os.path.dirname(__file__), "www", "shopping-list-card.js")
    if os.path.isfile(js_path):
        try:
            from homeassistant.components.http import StaticPathConfig
            await hass.http.async_register_static_paths([
                StaticPathConfig(STATIC_URL, js_path, cache_headers=False)
            ])
        except (ImportError, AttributeError):
            hass.http.register_static_path(STATIC_URL, js_path, cache_headers=False)
        add_extra_js_url(hass, STATIC_URL)
        _LOGGER.info("[shopping_list] Frontend card registered: %s", STATIC_URL)
    else:
        _LOGGER.warning("[shopping_list] JS file not found at %s", js_path)

    # Register Lovelace resource after HA fully starts
    async def _register_when_ready(event=None):
        await _async_register_lovelace_resource(hass)

    hass.bus.async_listen_once("homeassistant_started", _register_when_ready)

    _LOGGER.info("[shopping_list] Version %s loaded", VERSION)
    return True


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Write JS card URL directly into lovelace_resources .storage file."""
    try:
        resource_url = f"{STATIC_URL}?v={VERSION}"
        resources_store = Store(hass, 1, "lovelace_resources")
        resources_data = await resources_store.async_load() or {"items": []}
        items = resources_data.get("items", [])

        # Check if already registered (any version)
        existing = next((i for i in items if STATIC_URL in i.get("url", "")), None)

        if existing is None:
            items.append({"id": uuid.uuid4().hex, "type": "module", "url": resource_url})
            resources_data["items"] = items
            await resources_store.async_save(resources_data)
            _LOGGER.info("[shopping_list] Lovelace resource added: %s", resource_url)
        elif existing.get("url") != resource_url:
            existing["url"] = resource_url
            await resources_store.async_save(resources_data)
            _LOGGER.info("[shopping_list] Lovelace resource updated: %s", resource_url)
        else:
            _LOGGER.debug("[shopping_list] Lovelace resource already current: %s", resource_url)

        # Also try the live lovelace resource registry if available
        try:
            lr = hass.data.get("lovelace")
            if lr and hasattr(lr, "resources") and hasattr(lr.resources, "async_create_item"):
                # Already handled via store above; just log
                _LOGGER.debug("[shopping_list] Lovelace live registry available")
        except Exception:
            pass

    except Exception as exc:
        _LOGGER.warning("[shopping_list] Could not register Lovelace resource: %s", exc)


class ShoppingListVersionView(HomeAssistantView):
    url = "/api/shopping_list/version"
    name = "api:shopping_list:version"
    requires_auth = True

    async def get(self, request):
        from aiohttp.web import Response
        return Response(text=json.dumps({"version": VERSION}), content_type="application/json")


class ShoppingListDataView(HomeAssistantView):
    url = "/api/shopping_list/data"
    name = "api:shopping_list:data"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request):
        from aiohttp.web import Response
        data = self._hass.data.get(DOMAIN, {}).get("data", DEFAULT_DATA)
        return Response(text=json.dumps(data), content_type="application/json")

    async def post(self, request):
        from aiohttp.web import Response
        try:
            body = await request.json()
        except Exception:
            return Response(text=json.dumps({"error": "Invalid JSON"}), status=400, content_type="application/json")

        domain_data = self._hass.data.get(DOMAIN, {})
        store: Store = domain_data.get("store")
        if store is None:
            return Response(text=json.dumps({"error": "Store not available"}), status=500, content_type="application/json")

        domain_data["data"] = body
        await store.async_save(body)
        _LOGGER.debug("[shopping_list] Data saved (%d items)", len(body.get("items", [])))
        return Response(text=json.dumps({"ok": True}), content_type="application/json")


async def async_setup_entry(hass: HomeAssistant, entry) -> bool:
    return await async_setup(hass, {})


async def async_unload_entry(hass: HomeAssistant, entry) -> bool:
    hass.data.pop(DOMAIN, None)
    return True
