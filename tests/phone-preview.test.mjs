import test from "node:test";
import assert from "node:assert/strict";
import { choosePhoneAddress, phoneAddresses } from "../scripts/serve-phone.mjs";

const entry = (address, internal = false, family = "IPv4") => ({address, internal, family});

test("phone preview selects LAN IPv4 without binding loopback, public IP or link-local adapters", () => {
  const interfaces = {
    loopback: [entry("127.0.0.1", true)],
    wifi: [entry("192.168.42.15"), entry("fe80::1234", false, "IPv6")],
    disconnected: [entry("169.254.30.228")],
    public: [entry("203.0.113.5")]
  };
  assert.deepEqual(phoneAddresses(interfaces), ["192.168.42.15"]);
  assert.equal(choosePhoneAddress(interfaces), "192.168.42.15");
  assert.throws(() => choosePhoneAddress(interfaces, "0.0.0.0"));
});

test("phone preview requires a selected address when several LANs are connected", () => {
  const interfaces = {wifi:[entry("192.168.42.15")], vpn:[entry("10.0.0.2")]};
  assert.throws(() => choosePhoneAddress(interfaces), /Several networks/);
  assert.equal(choosePhoneAddress(interfaces, "192.168.42.15"), "192.168.42.15");
  assert.throws(() => choosePhoneAddress({}), /Connect this PC/);
});
