"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObject = void 0;
const exceptions_1 = require("../exceptions");
const guard_1 = require("../guard");
class ValueObject {
    constructor(props) {
        this.checkIfEmpty(props);
        this.validate(props);
        this.props = props;
    }
    static isValueObject(obj) {
        return obj instanceof ValueObject;
    }
    equals(vo) {
        if (vo === null || vo === undefined) {
            return false;
        }
        return JSON.stringify(this) === JSON.stringify(vo);
    }
    unpack() {
        if (this.isDomainPrimitive(this.props)) {
            return this.props.value;
        }
        const propsCopy = Object(this.props);
        return Object.freeze(propsCopy);
    }
    checkIfEmpty(props) {
        if (guard_1.Guard.isEmpty(props) ||
            (this.isDomainPrimitive(props) && guard_1.Guard.isEmpty(props.value))) {
            throw new exceptions_1.ArgumentNotProvidedException('Property cannot be empty');
        }
    }
    isDomainPrimitive(obj) {
        return !!Object.prototype.hasOwnProperty.call(obj, 'value');
    }
}
exports.ValueObject = ValueObject;
//# sourceMappingURL=value-object.base.js.map