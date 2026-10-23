/**
 * Magic UI's FlickeringGrid.
 *
 *   https://magicui.design/docs/components/flickering-grid
 *
 * A grid of small squares, each one fading to a new opacity at
 * random. Canvas 2D rather than a shader, which is the whole
 * reason it is the one that works behind Experience: that
 * section is four and a half thousand pixels tall, and a
 * full-screen fragment shader at that height is five times the
 * work of a screenful. A canvas redrawing ten thousand small
 * rectangles is not.
 *
 * It is also why there is no sticky trick here and nothing
 * hanging outside the section. The canvas is simply the size of
 * the section, which is what every other backdrop on this page
 * does, and the scanning grid that came before it could not.
 *
 * Changed from upstream: TypeScript stripped, and the device
 * pixel ratio pinned to one - see the comment on it.
 *
 * It holds its own IntersectionObserver and does not run a frame
 * while it is off screen.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "../../lib/cn"


export const FlickeringGrid = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isInView, setIsInView] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const memoizedColor = useMemo(() => {
    const toRGBA = (color) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`
      }
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      const ctx = canvas.getContext("2d")
      if (!ctx) return "rgba(255, 0, 0,"
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
      return `rgba(${r}, ${g}, ${b},`
    }
    return toRGBA(color)
  }, [color])

  const setupCanvas = useCallback(
    (canvas, width, height) => {
      // One device pixel, and not the display's own.
      //
      // This canvas is sized to its section, and Experience is
      // 4513 tall. At a retina ratio the backing store would be
      // 2850 by 9026 - a hundred megabytes of memory for a grid
      // of three-pixel squares nobody is looking at closely. At
      // one it is a quarter of that, and three-pixel squares
      // are three-pixel squares either way.
      const dpr = 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const cols = Math.ceil(width / (squareSize + gridGap))
      const rows = Math.ceil(height / (squareSize + gridGap))

      const squares = new Float32Array(cols * rows)
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity
      }

      return { cols, rows, squares, dpr }
    },
    [squareSize, gridGap, maxOpacity]
  )

  const updateSquares = useCallback(
    (squares, deltaTime) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity
        }
      }
    },
    [flickerChance, maxOpacity]
  )

  const drawGrid = useCallback(
    (
      ctx,
      width,
      height,
      cols,
      rows,
      squares,
      dpr
    ) => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "transparent"
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j]
          ctx.fillStyle = `${memoizedColor}${opacity})`
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          )
        }
      }
    },
    [memoizedColor, squareSize, gridGap]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas?.getContext("2d") ?? null
    let animationFrameId = null
    let resizeObserver = null
    let intersectionObserver = null
    let gridParams = null

    if (canvas && container && ctx) {
      const updateCanvasSize = () => {
        const newWidth = width || container.clientWidth
        const newHeight = height || container.clientHeight
        setCanvasSize({ width: newWidth, height: newHeight })
        gridParams = setupCanvas(canvas, newWidth, newHeight)
      }

      updateCanvasSize()

      let lastTime = 0
      const animate = (time) => {
        if (!isInView || !gridParams) return

        const deltaTime = (time - lastTime) / 1000
        lastTime = time

        updateSquares(gridParams.squares, deltaTime)
        drawGrid(
          ctx,
          canvas.width,
          canvas.height,
          gridParams.cols,
          gridParams.rows,
          gridParams.squares,
          gridParams.dpr
        )
        animationFrameId = requestAnimationFrame(animate)
      }

      resizeObserver = new ResizeObserver(() => {
        updateCanvasSize()
      })
      resizeObserver.observe(container)

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting)
        },
        { threshold: 0 }
      )
      intersectionObserver.observe(canvas)

      if (isInView) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect()
      }
    }
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView])

  return (
    <div
      ref={containerRef}
      className={cn(`h-full w-full ${className}`)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  )
}
