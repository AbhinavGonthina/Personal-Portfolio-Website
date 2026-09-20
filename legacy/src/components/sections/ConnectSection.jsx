import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Box, Typography, TextField, Button } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";

function ConnectSection() {
  // State management and refs
  const [phase, setPhase] = useState("static");
  const [hasAnimated, setHasAnimated] = useState(false);
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: "-100px",
    amount: 0.3,
  });

  // Animation sequence trigger
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      setPhase("star");
      setTimeout(() => setPhase("brightening"), 500);
      setTimeout(() => setPhase("exploding"), 1500);
      setTimeout(() => setPhase("done"), 3000);
    }
  }, [isInView, hasAnimated]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = Date.now();
    const storedTime = localStorage.getItem("lastSubmitTime");
    const lastTime = storedTime ? parseInt(storedTime, 10) : 0;

    // Rate limiting check (every 5 minutes or 300000 ms)
    if (now - lastTime < 300000) {
      const remainingTime = Math.ceil((300000 - (now - lastTime)) / 60000);
      setSubmitStatus(
        `Please wait ${remainingTime} more minute(s) before sending another message.`
      );
      return;
    }

    // Field validation so I can trace who is sending the feedback
    if (!formData.name.trim() || !formData.message.trim()) {
      setSubmitStatus("Please fill out both fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("");

    // Form submission to Web3Forms (only backend call in the entire app haha)
    try {
      const payload = new FormData();
      payload.append("access_key", "9e0abf8a-056a-47aa-af45-7fa3f96768af");
      payload.append("from_name", "Portfolio Form");
      payload.append("subject", "New Site Suggestion");
      payload.append("name", formData.name);
      payload.append("message", formData.message);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("Thanks for your suggestion! I'll review it soon.");
        setFormData({ name: "", message: "" });
        localStorage.setItem("lastSubmitTime", now.toString());
        e.target.reset?.();
      } else {
        setSubmitStatus(
          data.message || "Failed to send. Please try again later."
        );
      }
    } catch (err) {
      setSubmitStatus("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Social links data
  const socialLinks = [
    {
      name: "GitHub",
      value: "AbhinavGonthina",
      href: "https://github.com/AbhinavGonthina",
      icon: GitHubIcon,
    },
    {
      name: "LinkedIn",
      value: "Abhinav Gonthina",
      href: "https://linkedin.com/in/abhinavgonthina",
      icon: LinkedInIcon,
    },
    {
      name: "Email",
      value: "gonthina.a@northeastern.edu",
      href: "mailto:gonthina.a@northeastern.edu",
      icon: EmailIcon,
    },
    {
      name: "Resume",
      value: "AbhinavGonthinaResume.pdf",
      href: "https://drive.google.com/file/d/1mmaNnu9ERCRxq-6wIewLTS-31G37Ce_p/view?usp=sharing",
      icon: DescriptionIcon,
    },
  ];

  return (
    <Box
      id="connect-section"
      ref={containerRef}
      sx={{
        minHeight: "60vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Background stars */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          background: `
            radial-gradient(1px 1px at 10% 20%, white, transparent),
            radial-gradient(1px 1px at 30% 70%, white, transparent),
            radial-gradient(1px 1px at 60% 40%, white, transparent),
            radial-gradient(1px 1px at 85% 25%, white, transparent),
            radial-gradient(1px 1px at 70% 80%, white, transparent),
            radial-gradient(1px 1px at 15% 50%, white, transparent),
            radial-gradient(1px 1px at 45% 30%, white, transparent),
            radial-gradient(1px 1px at 75% 60%, white, transparent),
            radial-gradient(1px 1px at 90% 45%, white, transparent),
            radial-gradient(1px 1px at 25% 85%, white, transparent)
          `,
          backgroundSize: "300px 300px",
          willChange: "opacity",
        }}
      />

      {/* Animated star element */}
      {(phase === "static" || phase === "star" || phase === "brightening") && (
        <motion.div
          animate={{
            scale:
              phase === "brightening"
                ? [1, 1.2, 1.5]
                : phase === "star"
                  ? [0.9, 1, 0.9]
                  : 1,
          }}
          transition={{
            duration: phase === "brightening" ? 1 : 2,
            repeat: phase === "star" ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            willChange: "transform",
          }}
        >
          {/* Star core */}
          <Box
            sx={{
              position: "absolute",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background:
                phase === "brightening"
                  ? "radial-gradient(circle, #ffffff 0%, #ffffff 30%, #ffff00 60%, transparent 100%)"
                  : "radial-gradient(circle, #ffffff 0%, #ffffff 30%, #b0e0ff 60%, transparent 100%)",
              boxShadow:
                phase === "brightening"
                  ? `
                    0 0 30px #ffffff,
                    0 0 60px #ffff00,
                    0 0 90px #ff9500,
                    0 0 120px #ff4500
                  `
                  : `
                    0 0 30px #ffffff,
                    0 0 60px #b0e0ff,
                    0 0 90px #87ceeb
                  `,
              transition: "all 1s ease",
              filter: phase === "brightening" ? "blur(1px)" : "none",
              animation:
                phase === "brightening"
                  ? "pulse 0.3s ease-in-out infinite"
                  : "none",
              "@keyframes pulse": {
                "0%, 100%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.2)" },
              },
              willChange: "transform, filter",
              transform: "translateZ(0)",
            }}
          />

          {/* Main cross rays */}
          {[0, 90].map((angle) => (
            <Box
              key={angle}
              sx={{
                position: "absolute",
                width: "200px",
                height: "2px",
                background:
                  phase === "brightening"
                    ? "linear-gradient(90deg, transparent 10%, #ffff00 30%, #ffffff 50%, #ffff00 70%, transparent 90%)"
                    : "linear-gradient(90deg, transparent 10%, #b0e0ff 30%, #ffffff 50%, #b0e0ff 70%, transparent 90%)",
                transform: `rotate(${angle}deg) translateZ(0)`,
                transition: "all 1s ease",
                opacity: 0.9,
                boxShadow: `0 0 10px ${phase === "brightening" ? "#ffff00" : "#b0e0ff"}`,
                willChange: "background, box-shadow",
              }}
            />
          ))}

          {/* Diagonal rays */}
          {[45, 135].map((angle) => (
            <Box
              key={angle}
              sx={{
                position: "absolute",
                width: "150px",
                height: "1px",
                background:
                  phase === "brightening"
                    ? "linear-gradient(90deg, transparent 20%, #ffff00 50%, transparent 80%)"
                    : "linear-gradient(90deg, transparent 20%, #b0e0ff 50%, transparent 80%)",
                transform: `rotate(${angle}deg) translateZ(0)`,
                transition: "all 1s ease",
                opacity: 0.6,
                willChange: "background, opacity",
              }}
            />
          ))}

          {/* Outer glow halo */}
          <Box
            sx={{
              position: "absolute",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background:
                phase === "brightening"
                  ? "radial-gradient(circle, transparent 30%, rgba(255, 200, 0, 0.2) 60%, transparent 100%)"
                  : "radial-gradient(circle, transparent 30%, rgba(135, 206, 235, 0.2) 60%, transparent 100%)",
              transition: "all 1s ease",
              transform: "translateZ(0)",
              willChange: "background",
            }}
          />
        </motion.div>
      )}

      {/* Explosion animation effects */}
      {phase === "exploding" && (
        <>
          {/* Main shockwave */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 3, 6],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.6) 20%, rgba(255,140,0,0.4) 40%, rgba(255,69,0,0.2) 60%, transparent 80%)",
              zIndex: 1,
              willChange: "transform, opacity",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />

          {/* Ring blast */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 4, 8],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.2,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              border: "2px solid #ffd700",
              boxShadow: `
                0 0 40px #ffd700,
                inset 0 0 40px #ff8c00
              `,
              zIndex: 1,
              willChange: "transform, opacity",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />

          {/* Light rays burst */}
          {[0, 45, 90, 135].map((angle) => (
            <motion.div
              key={angle}
              initial={{
                scale: 0,
                opacity: 1,
              }}
              animate={{
                scale: [0, 15, 20],
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                width: "200px",
                height: "2px",
                background:
                  "linear-gradient(90deg, #ffffff, #ffd700, transparent)",
                transform: `rotate(${angle}deg) translateZ(0)`,
                transformOrigin: "center",
                boxShadow: "0 0 20px #ffd700",
                zIndex: 1,
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
              }}
            />
          ))}
        </>
      )}

      {/* Main connect content which comes out while the animation is finishing */}
      {(phase === "exploding" || phase === "done") && (
        <motion.div
          initial={{
            scale: 0,
            opacity: 0,
            filter: "brightness(3)",
          }}
          animate={{
            scale: 1,
            opacity: 1,
            filter: "brightness(1)",
          }}
          transition={{
            duration: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            zIndex: 2,
            willChange: "transform, opacity, filter",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
          <Box
            sx={{
              background: "rgba(10, 10, 15, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(34, 211, 238, 0.3)",
              borderRadius: "20px",
              padding: { xs: "30px", md: "40px" },
              width: { xs: "90vw", sm: "85vw", md: "80vw", lg: "90vw" },
              position: "relative",
              transform: "translateZ(0)",
            }}
          >
            {/* Background Stripe Pattern */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/CircleStripes.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: 0.1,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Section heading */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  mb: 4,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Let's Connect
              </Typography>
            </motion.div>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 5, sm: 7, md: 14 },
                alignItems: "stretch",
              }}
            >
              {/* Left Side- Feedback form section  */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ flex: 1 }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#22d3ee",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Have any site suggestions?
                  </Typography>

                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <TextField
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(34, 211, 238, 0.3)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(34, 211, 238, 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#22d3ee",
                          },
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: "rgba(255, 255, 255, 0.5)",
                          opacity: 1,
                        },
                      }}
                    />

                    <TextField
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                      multiline
                      rows={4}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          "& fieldset": {
                            borderColor: "rgba(34, 211, 238, 0.3)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(34, 211, 238, 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#22d3ee",
                          },
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: "rgba(255, 255, 255, 0.5)",
                          opacity: 1,
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: "#440fbdff",
                        color: "#FFFFFF",
                        borderBottom: "2px solid white",
                        padding: "12px",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        transition: "all 0.33s ease",
                        "&:hover": {
                          backgroundColor: "#314bc0ff",
                        },
                        "&:disabled": {
                          opacity: 0.5,
                        },
                      }}
                    >
                      {isSubmitting ? "Sending..." : "Send Suggestion"}
                    </Button>

                    {submitStatus && (
                      <Typography
                        sx={{
                          color: submitStatus.includes("Thanks")
                            ? "#22d3ee"
                            : "#ff6b6b",
                          fontSize: "0.9rem",
                          textAlign: "center",
                        }}
                      >
                        {submitStatus}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </motion.div>

              {/* Right Side - Social links grid */}
              <Box
                sx={{
                  flex: 1,
                  opacity: 0,
                  transform: "translateX(12px)",
                  animation:
                    "slideIn 320ms cubic-bezier(.2,.7,.2,1) 500ms forwards",
                  "@keyframes slideIn": {
                    to: { opacity: 1, transform: "translateX(0)" },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: { xs: 1.5, sm: 2, md: 2 },
                    height: "100%",
                  }}
                >
                  {socialLinks.map((link, index) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target={link.name !== "Email" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: "none",
                        display: "block",
                        opacity: 0,
                        transform: "scale(0.96)",
                        animation: `popIn 240ms cubic-bezier(.2,.7,.2,1) ${560 + index * 80}ms forwards`,
                      }}
                    >
                      <Box
                        sx={{
                          background: "rgba(34, 211, 238, 0.05)",
                          border: "1px solid rgba(34, 211, 238, 0.18)",
                          borderRadius: "12px",
                          padding: {
                            xs: "12px",
                            sm: "16px",
                            md: "18px",
                            lg: "20px",
                          },
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: { xs: 0.5, sm: 0.75, md: 1 },
                          height: "100%",
                          minHeight: {
                            xs: "90px",
                            sm: "100px",
                            md: "110px",
                            lg: "120px",
                          },
                          transition:
                            "transform 140ms ease, border-color 140ms ease, background 140ms ease",
                          "&:hover": {
                            background: "rgba(34, 211, 238, 0.08)",
                            borderColor: "#22d3ee",
                            transform: "scale(1.02)",
                          },
                          "@keyframes popIn": {
                            to: { opacity: 1, transform: "scale(1)" },
                          },
                        }}
                      >
                        <link.icon
                          sx={{
                            color: "#22d3ee",
                            fontSize: {
                              xs: "1.75rem",
                              sm: "2rem",
                              md: "2.25rem",
                              lg: "2.5rem",
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            color: "#22d3ee",
                            fontSize: {
                              xs: "0.75rem",
                              sm: "0.8rem",
                              md: "0.85rem",
                              lg: "0.9rem",
                            },
                            fontWeight: 600,
                            lineHeight: 1.2,
                          }}
                        >
                          {link.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: {
                              xs: "0.65rem",
                              sm: "0.7rem",
                              md: "0.75rem",
                              lg: "0.8rem",
                            },
                            textAlign: "center",
                            lineHeight: 1.2,
                            wordBreak: "break-word",
                            maxWidth: "100%",
                            px: 1,
                          }}
                        >
                          {link.value}
                        </Typography>
                      </Box>
                    </a>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
      )}
    </Box>
  );
}

export default ConnectSection;
