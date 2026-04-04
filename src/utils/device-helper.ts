import type { DeviceInfo } from "../types/types";

const getWindowsVersionName = (ntVersion: string): string => {
    switch (ntVersion) {
        case '10.0': return 'Windows 10 / 11';
        case '6.3': return 'Windows 8.1';
        case '6.2': return 'Windows 8';
        case '6.1': return 'Windows 7';
        default: return ntVersion;
    }
};

export const getOSAndVendor = async (): Promise<DeviceInfo> => {
    const ua = navigator.userAgent;
    const uaData = (navigator as any).userAgentData;

    const info: DeviceInfo = {
        osName: 'Unknown',
        osVersion: 'Unknown',
        deviceVendor: 'Unknown',
        deviceType: 'Unknown'
    };

    /* ===============================
     * 1️⃣ ใช้ User-Agent Client Hints
     * =============================== */
    if (uaData) {
        const platform = uaData.platform;
        const brands = uaData.brands?.map((b: any) => b.brand).join(", ");

        info.deviceVendor = brands || 'Unknown';

        if (platform === 'Windows') {
            info.osName = 'Windows';
            info.deviceType = 'PC/Desktop';

            const highEntropy = await uaData.getHighEntropyValues([
                'platformVersion'
            ]);

            // platformVersion เช่น "15.0.0"
            info.osVersion = `Reported ${highEntropy.platformVersion}`;
            return info;
        }

        if (platform === 'macOS') {
            info.osName = 'MacOS';
            info.deviceVendor = 'Apple';
            info.deviceType = 'Macbook/Laptop';

            const highEntropy = await uaData.getHighEntropyValues([
                'platformVersion'
            ]);

            const version = highEntropy.platformVersion;
            if (version.startsWith('15')) {
                info.osVersion = `Sequoia ${version}`;
            } else if (version.startsWith('14')) {
                info.osVersion = `Sonoma ${version}`;
            } else {
                info.osVersion = version;
            }
            return info;
        }

        if (platform === 'Android') {
            info.osName = 'Android';
            info.deviceType = 'Mobile';
            info.osVersion = 'Android (Client Hint)';
            return info;
        }

        if (platform === 'iOS') {
            info.osName = 'iOS';
            info.deviceVendor = 'Apple';
            info.deviceType = 'Mobile';
            info.osVersion = 'iOS (Client Hint)';
            return info;
        }
    }

    /* ===============================
     * 2️⃣ Fallback: UserAgent เดิม
     * =============================== */

    let match: RegExpMatchArray | null;

    if ((match = ua.match(/Windows NT ([\d\.]+)/))) {
        info.osName = 'Windows';
        info.deviceType = 'PC/Desktop';
        info.deviceVendor = 'PC Vendor';
        info.osVersion = getWindowsVersionName(match[1]);
    }
    else if ((match = ua.match(/Mac OS X ([\d_]+)/))) {
        info.osName = 'MacOS';
        info.deviceVendor = 'Apple';
        info.deviceType = 'Macbook/Laptop';

        const version = match[1].replace(/_/g, '.');
        if (version.startsWith('15.')) {
            info.osVersion = `Sequoia ${version}`;
        } else if (version.startsWith('14.')) {
            info.osVersion = `Sonoma ${version}`;
        } else {
            info.osVersion = version;
        }
    }
    else if ((match = ua.match(/Android ([\d\.]+)/))) {
        info.osName = 'Android';
        info.deviceType = /Mobile/.test(ua) ? 'Mobile' : 'Tablet';
        info.osVersion = match[1];
        info.deviceVendor = /Samsung/i.test(ua) ? 'Samsung' : 'Android Vendor';
    }
    else if ((match = ua.match(/iPhone OS ([\d_]+)/))) {
        info.osName = 'iOS';
        info.deviceVendor = 'Apple';
        info.deviceType = 'Mobile';
        info.osVersion = match[1].replace(/_/g, '.');
    }
    else if (/Linux/.test(ua)) {
        info.osName = 'Linux';
        info.deviceType = 'PC/Desktop';
        info.osVersion = 'Unknown Distro';
        info.deviceVendor = 'PC Vendor';
    }

    return info;
};
