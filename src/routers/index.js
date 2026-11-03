import { wrapRouterHandlers } from "../middlewares/errorHandler.js";
import apartmentRouter from "./apartmentRoute.js";
import authRouter from "./authRoute.js";
import roleRouter from "./roleRoute.js";
import marketRouter from "./marketRoute.js";
import landlordRouter from "./landlordRoute.js";
import tenantRouter from "./tenantRoute.js";
import cartRouter from "./cartRoute.js";
import userProfileRouter from "./userProfileRoute.js";
import friendRequestRouter from "./friendrequestRouter.js";
import notificationDeviceRouter from "./notificationTokenRoute.js";
import messageRouter from "./messageRouter.js";
import propertyRouter from "./propertyRoute.js";
import ratingRouter from "./ratingRoute.js";
import geoLocationRouter from "./geoLocationRoute.js";
import apartmentFilesRouter from "./apartmentFilesRoute.js";
import apartmentPropertiesRouter from "./apartmentPropertiesRoute.js";
import facilitiesRouter from "./facilitiesRoute.js";
import propertyFacilitiesRouter from "./propertyFacilitiesRoute.js";
import propertyFilesRouter from "./propertyFilesRoute.js";
import propertyLocationRouter from "./propertyLocationRoute.js";
import apartmentLocationRouter from "./locationRoute.js";
import propertyPropertiesRouter from "./propertyPropertiesRoute.js";
import apartmentVerifyRouter from "./apartmentVerifyRoute.js";
import postMediaRouter from "./postMediaRouter.js";
import notificationRouter from "./notifyRoute.js";
import agentCommentRouter from "./agentCommentRoute.js";
import agentLocationRouter from "./agentLocationRoute.js";
import agentDocumentsRouter from "./agentDocumentsRoute.js";
import apartmentCommentRouter from "./apartmentCommentRoute.js";
import apartmentPaymentPlanRouter from "./apartmentPaymentRoute.js";
import agentProfileRouter from "./agentProfileRoute.js";

// Every REST router and the path it is mounted on, in mount order.
// Every router has its own paths: tests/routeTable.test.js fails when two
// routes share a method and path, because only the first would ever run.
export const apiRoutes = [
  ["/api/v1", apartmentRouter],
  ["/api/v1", authRouter],
  ["/api/v1", roleRouter],
  ["/api/v1", landlordRouter],
  ["/api/v1", tenantRouter],
  ["/api/v1", marketRouter],
  ["/api/v1/posts", postMediaRouter],
  ["/api/v1/apartment", apartmentFilesRouter],
  ["/api/v1/apartment-properties", apartmentPropertiesRouter],
  ["/api/v1/apartment-facilities", facilitiesRouter],
  ["/api/v1/property-facilities", propertyFacilitiesRouter],
  ["/api/v1/property", propertyFilesRouter],
  ["/api/v1/property-locations", propertyLocationRouter],
  ["/api/v1/location", apartmentLocationRouter],
  ["/api/v1/property-properties", propertyPropertiesRouter],
  ["/api/v1", cartRouter],
  ["/api/v1/user", userProfileRouter],
  ["/api/v1", friendRequestRouter],
  ["/api/v1/token", notificationDeviceRouter],
  ["/api/v1", ratingRouter],
  ["/api/v1", notificationRouter],
  ["/api/v1", messageRouter],
  ["/api/v1", propertyRouter],
  ["/api/v1", geoLocationRouter],
  ["/api/v1/verify-apartment", apartmentVerifyRouter],
  ["/api/v1", agentProfileRouter],
  ["/api/v1", agentCommentRouter],
  ["/api/v1", agentDocumentsRouter],
  ["/api/v1", agentLocationRouter],
  ["/api/v1", apartmentCommentRouter],
  ["/api/v1", apartmentPaymentPlanRouter],
];

export const mountApiRoutes = (app) => {
  for (const [path, router] of apiRoutes) {
    app.use(path, wrapRouterHandlers(router));
  }
};
