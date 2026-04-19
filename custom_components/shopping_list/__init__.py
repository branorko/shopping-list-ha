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
    """Set up the integration — called once on HA start."""

    # Guard: only set up once
    if DOMAIN in hass.data:
        _LOGGER.debug("[shopping_list] Already set up, skipping")
        return True

    store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
    data = await store.async_load()

    if data is None:
        data = {k: list(v) for k, v in DEFAULT_DATA.items()}
        await store.async_save(data)
        _LOGGER.info("[shopping_list] Created new data store")
    else:
        # Ensure all keys exist (migration safety)
        for key in DEFAULT_DATA:
            if key not in data:
                data[key] = []
        _LOGGER.info(
            "[shopping_list] Loaded: %d items, %d categories, %d products",
            len(data.get("items", [])),
            len(data.get("categories", [])),
            len(data.get("products", [])),
        )

    hass.data[DOMAIN] = {"store": store, "data": data, "version": VERSION}

    # Register REST API (only once — guarded by DOMAIN check above)
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
        _LOGGER.info("[shopping_list] Card registered: %s", STATIC_URL)
    else:
        _LOGGER.warning("[shopping_list] JS not found: %s", js_path)

    # Register Lovelace resource after HA fully starts
    async def _register_when_ready(event=None):
        await _async_register_lovelace_resource(hass)

    hass.bus.async_listen_once("homeassistant_started", _register_when_ready)

    _LOGGER.info("[shopping_list] v%s loaded", VERSION)
    return True


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Write JS card URL directly into lovelace_resources .storage file."""
    try:
        resource_url = f"{STATIC_URL}?v={VERSION}"
        resources_store = Store(hass, 1, "lovelace_resources")
        resources_data = await resources_store.async_load() or {"items": []}
        items = resources_data.get("items", [])

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
            _LOGGER.debug("[shopping_list] Lovelace resource already current")
    except Exception as exc:
        _LOGGER.warning("[shopping_list] Lovelace resource registration failed: %s", exc)


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
        # Always read from store to ensure fresh data
        domain_data = self._hass.data.get(DOMAIN, {})
        store: Store = domain_data.get("store")
        if store:
            fresh = await store.async_load()
            if fresh is not None:
                domain_data["data"] = fresh
        data = domain_data.get("data", DEFAULT_DATA)
        return Response(text=json.dumps(data), content_type="application/json")

    async def post(self, request):
        from aiohttp.web import Response
        try:
            body = await request.json()
        except Exception:
            return Response(text=json.dumps({"error": "Invalid JSON"}), status=400, content_type="application/json")

        # Validate structure
        for key in DEFAULT_DATA:
            if key not in body or not isinstance(body[key], list):
                return Response(
                    text=json.dumps({"error": f"Missing or invalid field: {key}"}),
                    status=400, content_type="application/json"
                )

        domain_data = self._hass.data.get(DOMAIN, {})
        store: Store = domain_data.get("store")
        if store is None:
            return Response(text=json.dumps({"error": "Store not available"}), status=500, content_type="application/json")

        domain_data["data"] = body
        await store.async_save(body)
        _LOGGER.debug(
            "[shopping_list] Saved: %d items, %d categories, %d products",
            len(body.get("items", [])),
            len(body.get("categories", [])),
            len(body.get("products", [])),
        )
        return Response(text=json.dumps({"ok": True}), content_type="application/json")


async def async_setup_entry(hass: HomeAssistant, entry) -> bool:
    """Config entry setup — delegates to async_setup (guarded against double-init)."""
    return await async_setup(hass, {})


async def async_unload_entry(hass: HomeAssistant, entry) -> bool:
    hass.data.pop(DOMAIN, None)
    return True
