// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import axios from "axios";
import fs from "fs";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
	process.env.NODE_ENV === "production"
		? `${process.cwd()}/frontend/dist`
		: `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
	shopify.config.auth.callbackPath,
	shopify.auth.callback(),
	shopify.redirectToShopifyOrAppRoot()
);
app.post(
	shopify.config.webhooks.path,
	shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
	const countData = await shopify.api.rest.Product.count({
		session: res.locals.shopify.session,
	});
	res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
	let status = 200;
	let error = null;

	try {
		await productCreator(res.locals.shopify.session);
	} catch (e) {
		console.log(`Failed to process products/create: ${e.message}`);
		status = 500;
		error = e.message;
	}
	res.status(status).send({ success: status === 200, error });
});

app.get("/api/update/theme", async (_req, res) => {
	console.log("received request to update Theme.");
	// await uploadTheme(
	// 	"bayc-1",
	// 	"../themes/bayc-theme.zip"
	// );
    try {
        const theme = new shopify.api.rest.Theme({session: res.locals.shopify.session});
        // theme.name = "bayc-1";
        // theme.src = "https://metafi-mvp.s3.amazonaws.com/images/bayc-theme.zip";
        theme.id = 147626524950;
        theme.role = "main";
        await theme.save({
            update: true,
        });
    } catch (e) {
		console.error(`Error uploading theme: ${e.message}`);
    }

	res.status(200).send({ success: true });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
	return res
		.status(200)
		.set("Content-Type", "text/html")
		.send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
