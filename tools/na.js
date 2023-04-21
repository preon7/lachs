import fetch from 'node-fetch';
import createDebug from 'debug';
import { defineResponse, ErrorResponse } from './util.js';
import { timeoutSignal } from '../util/misc.js';
const debug = createDebug('nxapi:api:na');
export async function getNintendoAccountSessionToken(code, verifier, client_id) {
    debug('Getting Nintendo Account session token');
    console.log("using patched auth");
    const [signal, cancel] = timeoutSignal();
    const response = await fetch('https://accounts.nintendo.com/connect/1.0.0/api/session_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Platform': 'Android',
            'X-ProductVersion': '2.5.0', // patched by Furen (https://github.com/preon7)
            'User-Agent': 'NASDKAPI; Android',
        },
        body: new URLSearchParams({
            client_id,
            session_token_code: code,
            session_token_code_verifier: verifier,
        }).toString(),
        signal,
    }).finally(cancel);
    if (response.status !== 200) {
        throw new ErrorResponse('[na] Non-200 status code', response, await response.text());
    }
    const token = await response.json();
    if ('errorCode' in token) {
        throw new ErrorResponse('[na] ' + token.detail, response, token);
    }
    if ('error' in token) {
        throw new ErrorResponse('[na] ' + token.error_description ?? token.error, response, token);
    }
    debug('Got Nintendo Account session token', token);
    return defineResponse(token, response);
}
export async function getNintendoAccountToken(token, client_id) {
    debug('Getting Nintendo Account token');
    const [signal, cancel] = timeoutSignal();
    const response = await fetch('https://accounts.nintendo.com/connect/1.0.0/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 8.0.0)',
        },
        body: JSON.stringify({
            client_id,
            session_token: token,
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer-session-token',
        }),
        signal,
    }).finally(cancel);
    if (response.status !== 200) {
        throw new ErrorResponse('[na] Non-200 status code', response, await response.text());
    }
    const nintendoAccountToken = await response.json();
    if ('errorCode' in nintendoAccountToken) {
        throw new ErrorResponse('[na] ' + nintendoAccountToken.detail, response, nintendoAccountToken);
    }
    if ('error' in nintendoAccountToken) {
        throw new ErrorResponse('[na] ' + nintendoAccountToken.error_description ?? nintendoAccountToken.error, response, nintendoAccountToken);
    }
    debug('Got Nintendo Account token', nintendoAccountToken);
    return defineResponse(nintendoAccountToken, response);
}
export async function getNintendoAccountUser(token) {
    debug('Getting Nintendo Account user info');
    const [signal, cancel] = timeoutSignal();
    const response = await fetch('https://api.accounts.nintendo.com/2.0.0/users/me', {
        headers: {
            'Accept-Language': 'en-GB',
            'User-Agent': 'NASDKAPI; Android',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token.access_token,
        },
        signal,
    }).finally(cancel);
    if (response.status !== 200) {
        throw new ErrorResponse('[na] Non-200 status code', response, await response.text());
    }
    const user = await response.json();
    if ('errorCode' in user) {
        throw new ErrorResponse('[na] ' + user.detail, response, user);
    }
    debug('Got Nintendo Account user info', user);
    return defineResponse(user, response);
}
export var NintendoAccountScope;
(function (NintendoAccountScope) {
    NintendoAccountScope["OPENID"] = "openid";
    NintendoAccountScope["OFFLINE"] = "offline";
    NintendoAccountScope["USER"] = "user";
    NintendoAccountScope["USER_BIRTHDAY"] = "user.birthday";
    NintendoAccountScope["USER_MII"] = "user.mii";
    NintendoAccountScope["USER_SCREENNAME"] = "user.screenName";
    NintendoAccountScope["USER_EMAIL"] = "user.email";
    NintendoAccountScope["USER_LINKS"] = "user.links[].id";
    NintendoAccountScope["USER_LINKS_NNID"] = "user.links.nintendoNetwork.id";
    NintendoAccountScope["USER_MEMBERSHIP"] = "user.membership";
    NintendoAccountScope["USER_WISHLIST"] = "user.wishlist";
    NintendoAccountScope["ESHOP_DEMO"] = "eshopDemo";
    NintendoAccountScope["ESHOP_DEVICE"] = "eshopDevice";
    NintendoAccountScope["ESHOP_PRICE"] = "eshopPrice";
    NintendoAccountScope["MISSIONSTATUS"] = "missionStatus";
    NintendoAccountScope["MISSIONSTATUS_PROGRESS"] = "missionStatus:progress";
    NintendoAccountScope["POINTWALLET"] = "pointWallet";
    NintendoAccountScope["USERNOTIFICATIONMESSAGE_ANYCLIENTS"] = "userNotificationMessage:anyClients";
    NintendoAccountScope["USERNOTIFICATIONMESSAGE_ANYCLIENTS_WRITE"] = "userNotificationMessage:anyClients:write";
    NintendoAccountScope["MOONUSER_ADMINISTRATION"] = "moonUser:administration";
    NintendoAccountScope["MOONDEVICE_CREATE"] = "moonDevice:create";
    NintendoAccountScope["MOONOWNEDDEVICE_ADMINISTRATION"] = "moonOwnedDevice:administration";
    NintendoAccountScope["MOONPARENTALCONTROLSETTING"] = "moonParentalControlSetting";
    NintendoAccountScope["MOONPARENTALCONTROLSETTING_UPDATE"] = "moonParentalControlSetting:update";
    NintendoAccountScope["MOONPARENTALCONTROLSETTINGSTATE"] = "moonParentalControlSettingState";
    NintendoAccountScope["MOONPAIRINGSTATE"] = "moonPairingState";
    NintendoAccountScope["MOONSMARTDEVICE_ADMINISTRATION"] = "moonSmartDevice:administration";
    NintendoAccountScope["MOONDAILYSUMMARY"] = "moonDailySummary";
    NintendoAccountScope["MOONMONTHLYSUMMARY"] = "moonMonthlySummary";
})(NintendoAccountScope = NintendoAccountScope || (NintendoAccountScope = {}));
export var NintendoAccountJwtScope;
(function (NintendoAccountJwtScope) {
    NintendoAccountJwtScope[NintendoAccountJwtScope["openid"] = 0] = "openid";
    NintendoAccountJwtScope[NintendoAccountJwtScope["user"] = 8] = "user";
    NintendoAccountJwtScope[NintendoAccountJwtScope["user.birthday"] = 9] = "user.birthday";
    NintendoAccountJwtScope[NintendoAccountJwtScope["user.mii"] = 17] = "user.mii";
    NintendoAccountJwtScope[NintendoAccountJwtScope["user.screenName"] = 23] = "user.screenName";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonUser:administration"] = 320] = "moonUser:administration";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonDevice:create"] = 321] = "moonDevice:create";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonOwnedDevice:administration"] = 325] = "moonOwnedDevice:administration";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonParentalControlSetting"] = 322] = "moonParentalControlSetting";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonParentalControlSetting:update"] = 323] = "moonParentalControlSetting:update";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonParentalControlSettingState"] = 324] = "moonParentalControlSettingState";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonPairingState"] = 326] = "moonPairingState";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonSmartDevice:administration"] = 327] = "moonSmartDevice:administration";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonDailySummary"] = 328] = "moonDailySummary";
    NintendoAccountJwtScope[NintendoAccountJwtScope["moonMonthlySummary"] = 329] = "moonMonthlySummary";
    // 10, 12, 70, 81, 198, 288, 289, 291, 292, 356, 357, 376
    // 'user.email' = -1,
    // 'user.links[].id' = -1,
    // 'user.membership' = -1,
    // 'user.wishlist' = -1,
    // 'eshopDemo' = -1,
    // 'eshopDevice' = -1,
    // 'eshopPrice' = -1,
    // 'missionStatus' = -1,
    // 'missionStatus:progress' = -1,
    // 'pointWallet' = -1,
    // 'userNotificationMessage:anyClients' = -1,
    // 'userNotificationMessage:anyClients:write' = -1,
    // 1, 31
    // 'offline' = -1,
    // 'user.links.nintendoNetwork.id' = -1,
})(NintendoAccountJwtScope = NintendoAccountJwtScope || (NintendoAccountJwtScope = {}));
//# sourceMappingURL=na.js.map