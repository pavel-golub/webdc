export class SuuntoVyperConsts {
    static HDR_DEVINFO_VYPER = 0x24
    static HDR_DEVINFO_SPYDER = 0x16
    static HDR_DEVINFO_BEGIN = SuuntoVyperConsts.HDR_DEVINFO_SPYDER
    static HDR_DEVINFO_END = SuuntoVyperConsts.HDR_DEVINFO_VYPER + 6
    static SZ_MEMORY = 0x2000;
    static SZ_PACKET = 32
    static NGASMIXES = 3

    static suunto_vyper_layout = {
        eop: 0x51, /* eop */
        rb_profile_begin: 0x71, /* rb_profile_begin */
        rb_profile_end: SuuntoVyperConsts.SZ_MEMORY, /* rb_profile_end */
        fp_offset: 9, /* Fingerprint */
        peek: 5 /* peek */
    };
}