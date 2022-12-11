/**
 /**
 * @apiDefine failed
 * @apiSuccessExample {JSON} Response: HTTP/1.1 401
 {
    "code": "UNAUTHORIZED_ERROR",
    "name": "credentials_required",
    "message": "No authorization token was found"
 }
 *
 * @apiSuccessExample {JSON} Response: HTTP/1.1 403
 {
    "code": "FORBIDDEN",
    "name": "Forbidden",
    "message": "You don't have permission to access this resource."
 }
 *
 * @apiSuccessExample {JSON} Response: HTTP/1.1 409
 {
    "code": "CONFLICT",
    "name": "conflict",
    "message": "Conflict params (confuse param)"
 }
 *
 * @apiSuccessExample {JSON} Response: HTTP/1.1 410
 {
    "code": "GONE",
    "name": "gone",
    "message": "Indicates that the resource requested is no longer available and will not be available again"
 }
 *
 *  @apiSuccessExample {JSON} Response: HTTP/1.1 422
 {
    "code": "UNPROCESSABLE_ENTITY",
    "name": "unprocessable_entity",
    "message": "Content type of the request entity, and the syntax of the request entity is correct, but it was unable to process the contained instructions. (missing params, param invalid)"
 }
 */

/**
 * @apiDefine Error4xx
 * @apiError (Error 4xx) 404-NotFound Error accessing data nothing
 */

/**
 * @apiDefine lang
 * @apiParam (QueryString) {String} [lang] Lang is English, Cambodia, China <=> param <code>en, km, zh</code>
 */

/**
 * @apiDefine cursor
 * @apiParam (QueryString) {Number} [pageSize] size page, set <code>pageSize=-1</code> => get all (don't priority)
 * @apiParam (QueryString) {String} [select] field select, example- <code>"email:1"</code>
 * @apiParam (QueryString) {String} [sort] sorting, example- <code>"date_created:-1"</code>
 * @apiParam (QueryString) {String} [populations] populate references info, example- <code>"wholesaler:name address;normal:name avatar"</code>
 * @apiParam (QueryString) {String} [where] where condition match, example- <code>"email:manhhipkhmt2@gmail.com;role:wholesaler"</code>
 * @apiParam (QueryString) {String} [pattern] pattern condition pattern regex, example- <code>"email:manhhipkhmt;first_name:n;role:wholesaler"</code>
 * @apiParam (QueryString) {String} [next] Cursor next page
 * @apiParam (QueryString) {String} [previous] Cursor previous page
 */

/**
 * @apiDefine pagination
 * @apiParam (QueryString) {Number} [page] page selected
 * @apiParam (QueryString) {Number} [pageSize] size page, set <code>pageSize=-1</code> => get all (don't priority)
 * @apiParam (QueryString) {String} [select] field select, example- <code>"email:1"</code>
 * @apiParam (QueryString) {String} [sort] sorting, example- <code>"date_created:-1"</code>
 * @apiParam (QueryString) {String} [populations] populate references info, example- <code>"wholesaler:name address;normal:name avatar"</code>
 * @apiParam (QueryString) {String} [where] where condition match, example- <code>"email:manhhipkhmt2@gmail.com;role:wholesaler"</code>
 * @apiParam (QueryString) {String} [pattern] pattern condition pattern regex, example- <code>"email:manhhipkhmt;first_name:n;role:wholesaler"</code>
 */

/**
 * @apiDefine header
 *
 * @apiHeaderExample {JSON} Header-Example:
 {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTlmNjcwZDRhZjYxZjA3OGUyODY1ODkiLCJyb2xlIjoiZHJpdmVyIiwiYWN0aXZlIjp7InByb2ZpbGUiOnRydWUsInRheFByb2ZpbGUiOmZhbHNlLCJ2ZXJpZnlFbWFpbCI6ZmFsc2UsImxpbmtBY2NvdW50Ijp0cnVlfSwicmVjZWl2ZU5vdGlmeSI6dHJ1ZSwiYXZhdGFyIjoiMTUyMDQxMDI3NzM5Nk1hbGUtQXZhdGFyLU11c3RhY2hlLWljb24ucG5nIiwicGF0aEltYWdlIjoiaHR0cDovLzUyLjc3LjI0NS4xOTU6ODg4OC9wdWJsaWMvIiwiaWF0IjoxNTIwODU1MjgzLCJleHAiOjE1MjM0NDcyODN9.y5ir-Hn2oiwwekObIHtXfPB__V2WqMjSwwx8fr0PReU",
    "Content-Type": "application/json"
 }
 *
 */
