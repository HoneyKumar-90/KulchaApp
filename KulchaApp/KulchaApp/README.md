# Kulcha Delivery – Android app (React Native / Expo)

Customer app for the Kulcha Delivery .NET API: login/register, menu, cart, checkout, order tracking.

## 1. Point the app to your API
Edit `src/config.js` -> `API_URL`.
- Emulator + API on your PC: `http://10.0.2.2:5000` (use the http port shown by `dotnet run`)
- Real phone on same Wi-Fi: `http://<PC-LAN-IP>:5000` (allow the port in Windows Firewall)
- Production: your hosted HTTPS URL (host the API on Azure App Service / VPS first)

## 2. Run in development
```
npm install
npx expo install --fix      # aligns package versions with the Expo SDK
npx expo start
```
Scan the QR code with the Expo Go app on your phone (or press `a` for an emulator).

## 3. Build the APK
**Option A – Expo cloud build (easiest, no Android Studio):**
```
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
When finished, EAS gives a download link to the `.apk`. Install it on any Android phone.

**Option B – Local build (needs Android Studio / SDK + JDK 17):**
```
npx expo prebuild -p android
cd android
./gradlew assembleRelease
```
APK: `android/app/build/outputs/apk/release/app-release.apk`

## Notes
- `usesCleartextTraffic` is enabled so plain `http://` works during testing. Remove the plugin in `app.json` and use HTTPS for production.
- Add `icon` and `splash` images in `app.json` before publishing to Play Store.
- Use `--profile production` to get an `.aab` for Google Play.
- Admin functions (menu management, order status updates) are not in this app, use Swagger or build an admin panel.
