import {
  isString,
  isFunction,
  isObject,
  isArray,
  ShapeFlags,
  SlotFlags
} from '@vue/shared'
import { isSuspense } from './components/Suspense'
import { isTeleport } from './components/Teleport'
import {
  currentRenderingInstance,
  currentScopeId
} from './componentRenderContext'
import { isRef } from '@vue/reactivity'

export const Fragment = Symbol.for('v-fgt')
const createVNodeWithArgsTransform = (...args) => {
  return _createVNode(...args)
}
export const createVNode = createVNodeWithArgsTransform

const normalizeKey = ({ key }) => (key != null ? key : null)
const normalizeRef = ({ ref, ref_key, ref_for }) => {
  return ref != null
    ? isString(ref) || isRef(ref) || isFunction(ref)
      ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for }
      : ref
    : null
}
function createBaseVNode(
  type,
  props = null,
  children = null,
  patchFlag = 0,
  dynamicProps = null,
  shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT,
  isBlockNode = false,
  needFullChildrenNormalization = false
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  }
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children)
  } else if (children) {
    vnode.shapeFlag |= isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN
  }
  return vnode
}

function _createVNode(
  type,
  props = null,
  children = null,
  patchFlag = 0,
  dynamicProps = null,
  isBlockNode = false
) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isSuspense(type)
    ? ShapeFlags.SUSPENSE
    : isTeleport(type)
    ? ShapeFlags.TELEPORT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : isFunction(type)
    ? ShapeFlags.FUNCTIONAL_COMPONENT
    : 0
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  )
}

export const InternalObjectKey = `__vInternal`
export const Text = Symbol.for('v-txt')
export function createTextVNode(text = ' ', flag = 0) {
  return createVNode(Text, null, text, flag)
}
export function normalizeChildren(vnode, children) {
  let type = 0
  const { shapeFlag } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    if (shapeFlag & (ShapeFlags.ELEMENT | ShapeFlags.TELEPORT)) {
      const slot = children.default
      if (slot) {
        slot._c && (slot._d = false)
        normalizeChildren(vnode, slot())
        slot._c && (slot._d = true)
      }
      return
    } else {
      type = ShapeFlags.SLOTS_CHILDREN
      const slotFlag = children._
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance
      } else if (slotFlag === SlotFlags.FORWARDED && currentRenderingInstance) {
        if ((currentRenderingInstance.slots._ = SlotFlags.STABLE)) {
          children._ = SlotFlags.STABLE
        } else {
          children._ = SlotFlags.DYNAMIC
          vnode.patchFlag |= PatchFlags.DYNAMIC_SLOTS
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance }
    type = ShapeFlags.SLOTS_CHILDREN
  } else {
    children = String(children)
    if (shapeFlag & ShapeFlags.TELEPORT) {
      type = ShapeFlags.ARRAY_CHILDREN
      children = [createTextVNode(children)]
    } else {
      type = ShapeFlags.TEXT_CHILDREN
    }
  }
  vnode.children = children
  vnode.shapeFlag |= type
}
